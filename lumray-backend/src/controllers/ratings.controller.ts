import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const upsertRating = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { movieId, score } = req.body

        if (!movieId || score === undefined) {
            return res.status(400).json({ data: null, error: 'Bad request', message: 'movieId and score are required' })
        }
        if (score < 0.5 || score > 5) {
            return res.status(400).json({ data: null, error: 'Bad request', message: 'score must be between 0.5 and 5' })
        }

        const rating = await prisma.rating.upsert({
            where: { userId_movieId: { userId, movieId } },
            create: { userId, movieId, score },
            update: { score },
        })

        return res.json({ data: rating, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deleteRating = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { movieId } = req.params

        await prisma.rating.deleteMany({ where: { userId, movieId } })

        return res.json({ data: null, error: null, message: 'Rating removed' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getMyRating = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { movieId } = req.params

        const rating = await prisma.rating.findUnique({
            where: { userId_movieId: { userId, movieId } },
        })

        return res.json({ data: rating, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
