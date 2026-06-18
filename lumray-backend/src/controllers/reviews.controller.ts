import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getFeaturedReviews = async (_req: Request, res: Response) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { reviewLikes: { _count: 'desc' } },
            take: 6,
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                movie: { select: { tmdbId: true, title: true, posterPath: true } },
                _count: { select: { reviewLikes: true } },
            },
        })

        return res.json({
            data: reviews.map(r => ({
                id:        r.id,
                content:   r.content,
                rating:    r.rating,
                createdAt: r.createdAt,
                user:      r.user,
                movie:     r.movie,
                likeCount: r._count.reviewLikes,
            })),
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getReview = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params
        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user:  { select: { id: true, username: true, avatar: true } },
                movie: { select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true } },
                _count: { select: { reviewLikes: true, comments: true } },
            },
        })
        if (!review) return res.status(404).json({ data: null, error: 'Not found', message: 'Review not found' })

        let isLiked = false
        if (req.user?.id) {
            const like = await prisma.reviewLike.findUnique({
                where: { userId_reviewId: { userId: req.user.id, reviewId: id } },
            })
            isLiked = !!like
        }

        return res.json({
            data: {
                ...review,
                isLiked,
                _count: { likes: review._count.reviewLikes, comments: review._count.comments },
            },
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getReviews = async (req: AuthRequest, res: Response) => {
    try {
        const { movieId } = req.query
        if (!movieId) return res.status(400).json({ data: null, error: 'Bad request', message: 'movieId is required' })

        const reviews = await prisma.review.findMany({
            where: { movieId: String(movieId) },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                _count: { select: { reviewLikes: true, comments: true } },
            },
        })

        let likedSet = new Set<string>()
        if (req.user?.id) {
            const likes = await prisma.reviewLike.findMany({
                where: { userId: req.user.id, reviewId: { in: reviews.map(r => r.id) } },
                select: { reviewId: true },
            })
            likedSet = new Set(likes.map(l => l.reviewId))
        }

        return res.json({
            data: reviews.map(r => ({
                ...r,
                _count: { likes: r._count.reviewLikes, comments: r._count.comments },
                isLiked: likedSet.has(r.id),
            })),
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { movieId, content, rating } = req.body

        if (!movieId || !content?.trim()) {
            return res.status(400).json({ data: null, error: 'Bad request', message: 'movieId and content are required' })
        }

        const review = await prisma.review.upsert({
            where: { userId_movieId: { userId, movieId } },
            create: { userId, movieId, content: content.trim(), rating: rating ?? null },
            update: { content: content.trim(), rating: rating ?? null },
            include: {
                user: { select: { id: true, username: true, avatar: true } },
                _count: { select: { reviewLikes: true, comments: true } },
            },
        })

        return res.status(201).json({ data: review, error: null, message: 'Review saved' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const updateReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id } = req.params
        const { content, rating } = req.body

        const existing = await prisma.review.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Review not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your review' })

        const review = await prisma.review.update({
            where: { id },
            data: { content: content.trim(), rating: rating ?? null },
        })

        return res.json({ data: review, error: null, message: 'Review updated' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deleteReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id } = req.params

        const existing = await prisma.review.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Review not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your review' })

        await prisma.review.delete({ where: { id } })

        return res.json({ data: null, error: null, message: 'Review deleted' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const likeReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: reviewId } = req.params

        await prisma.reviewLike.upsert({
            where: { userId_reviewId: { userId, reviewId } },
            create: { userId, reviewId },
            update: {},
        })

        return res.json({ data: null, error: null, message: 'Liked' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const unlikeReview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: reviewId } = req.params

        await prisma.reviewLike.deleteMany({ where: { userId, reviewId } })

        return res.json({ data: null, error: null, message: 'Unliked' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getReviewComments = async (req: Request, res: Response) => {
    try {
        const { id: reviewId } = req.params

        const comments = await prisma.comment.findMany({
            where: { reviewId },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { id: true, username: true, avatar: true } } },
        })

        return res.json({ data: comments, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const addReviewComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id: reviewId } = req.params
        const { content } = req.body

        if (!content?.trim()) {
            return res.status(400).json({ data: null, error: 'Bad request', message: 'content is required' })
        }

        const comment = await prisma.comment.create({
            data: { userId, reviewId, content: content.trim() },
            include: { user: { select: { id: true, username: true, avatar: true } } },
        })

        return res.status(201).json({ data: comment, error: null, message: 'Comment added' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deleteReviewComment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { commentId } = req.params

        const comment = await prisma.comment.findUnique({ where: { id: commentId } })
        if (!comment) return res.status(404).json({ data: null, error: 'Not found', message: 'Comment not found' })

        // Comment author OR review author can delete
        if (comment.userId !== userId) {
            const review = await prisma.review.findUnique({ where: { id: comment.reviewId! } })
            if (review?.userId !== userId) {
                return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your comment' })
            }
        }

        await prisma.comment.delete({ where: { id: commentId } })

        return res.json({ data: null, error: null, message: 'Comment deleted' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
