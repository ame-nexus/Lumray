import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getPosts = async (req: AuthRequest, res: Response) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20)

        const { movieId } = req.query
        const where = movieId ? { movieId: String(movieId) } : {}

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: { select: { id: true, username: true, avatar: true } },
                    movie: { select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true } },
                    _count: { select: { likes: true, comments: true } },
                },
            }),
            prisma.post.count({ where }),
        ])

        let likedSet = new Set<string>()
        if (req.user?.id) {
            const likes = await prisma.postLike.findMany({
                where: { userId: req.user.id, postId: { in: posts.map(p => p.id) } },
                select: { postId: true },
            })
            likedSet = new Set(likes.map(l => l.postId))
        }

        return res.json({
            data: {
                posts: posts.map(p => ({ ...p, isLiked: likedSet.has(p.id) })),
                total, page, totalPages: Math.ceil(total / limit),
            },
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getPostComments = async (req: Request, res: Response) => {
    try {
        const { id: postId } = req.params
        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { id: true, username: true, avatar: true } } },
        })
        return res.json({ data: comments, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { content, movieId, movieTmdbId, movieTitle, moviePosterPath, imageUrl, tags } = req.body

        const text = content?.trim() ?? ''
        if (!text && !imageUrl && !movieTmdbId && !movieId) {
            return res.status(400).json({ data: null, error: 'Bad request', message: 'Post needs text, an image, or a film' })
        }

        // Resolve a film reference: ensure a (minimal) Movie row exists so movieId FK is valid
        let resolvedMovieId: string | null = movieId ?? null
        if (!resolvedMovieId && movieTmdbId) {
            const movie = await prisma.movie.upsert({
                where:  { tmdbId: Number(movieTmdbId) },
                create: { tmdbId: Number(movieTmdbId), title: movieTitle ?? 'Untitled', overview: '', posterPath: moviePosterPath ?? null },
                update: {},
            })
            resolvedMovieId = movie.id
        }

        const post = await prisma.post.create({
            data: {
                userId,
                content: text,
                movieId: resolvedMovieId,
                imageUrl: imageUrl ?? null,
                tags: tags ?? [],
            },
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                movie: { select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true } },
                _count: { select: { likes: true, comments: true } },
            },
        })

        return res.status(201).json({ data: post, error: null, message: 'Post created' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id } = req.params

        const existing = await prisma.post.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Post not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your post' })

        await prisma.post.delete({ where: { id } })

        return res.json({ data: null, error: null, message: 'Post deleted' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: postId } = req.params

        await prisma.postLike.upsert({
            where: { userId_postId: { userId, postId } },
            create: { userId, postId },
            update: {},
        })

        return res.json({ data: null, error: null, message: 'Liked' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const unlikePost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: postId } = req.params

        await prisma.postLike.deleteMany({ where: { userId, postId } })

        return res.json({ data: null, error: null, message: 'Unliked' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const commentOnPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: postId } = req.params
        const { content, parentId } = req.body

        if (!content?.trim()) return res.status(400).json({ data: null, error: 'Bad request', message: 'content is required' })

        const comment = await prisma.comment.create({
            data: { userId, postId, content: content.trim(), parentId: parentId ?? null },
            include: { user: { select: { id: true, username: true, avatar: true } } },
        })

        return res.status(201).json({ data: comment, error: null, message: 'Comment added' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const editComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { commentId } = req.params
        const { content } = req.body

        if (!content?.trim()) return res.status(400).json({ data: null, error: 'Bad request', message: 'content is required' })

        const existing = await prisma.comment.findUnique({ where: { id: commentId } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Comment not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your comment' })

        const comment = await prisma.comment.update({
            where: { id: commentId },
            data:  { content: content.trim() },
            include: { user: { select: { id: true, username: true, avatar: true } } },
        })

        return res.json({ data: comment, error: null, message: 'Comment updated' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deleteComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { commentId } = req.params

        const existing = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { post: { select: { userId: true } } },
        })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Comment not found' })

        // The comment author OR the post owner may delete it
        const canDelete = existing.userId === userId || existing.post?.userId === userId
        if (!canDelete) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not allowed' })

        await prisma.comment.delete({ where: { id: commentId } })  // replies cascade

        return res.json({ data: { id: commentId }, error: null, message: 'Comment deleted' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
