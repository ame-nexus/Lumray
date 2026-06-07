import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getReviews = async (req: Request, res: Response) => {
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

        return res.json({ data: reviews, error: null, message: 'ok' })
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
