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
        const { content, movieId, tags } = req.body

        if (!content?.trim()) return res.status(400).json({ data: null, error: 'Bad request', message: 'content is required' })

        const post = await prisma.post.create({
            data: {
                userId,
                content: content.trim(),
                movieId: movieId ?? null,
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
        const { content } = req.body

        if (!content?.trim()) return res.status(400).json({ data: null, error: 'Bad request', message: 'content is required' })

        const comment = await prisma.comment.create({
            data: { userId, postId, content: content.trim() },
            include: { user: { select: { id: true, username: true, avatar: true } } },
        })

        return res.status(201).json({ data: comment, error: null, message: 'Comment added' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
