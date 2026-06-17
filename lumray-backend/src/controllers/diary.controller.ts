import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getDiary = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const page  = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20)

        const [entries, total] = await Promise.all([
            prisma.diaryEntry.findMany({
                where: { userId },
                orderBy: { watchedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    movie: {
                        select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true }
                    },
                },
            }),
            prisma.diaryEntry.count({ where: { userId } }),
        ])

        return res.json({
            data: { entries, total, page, totalPages: Math.ceil(total / limit) },
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const createDiaryEntry = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { movieId, watchedAt, rating, notes, isRewatch } = req.body

        if (!movieId) return res.status(400).json({ data: null, error: 'Bad request', message: 'movieId is required' })

        const entry = await prisma.diaryEntry.create({
            data: {
                userId,
                movieId,
                watchedAt: watchedAt ? new Date(watchedAt) : new Date(),
                rating: rating ?? null,
                notes: notes ?? null,
                isRewatch: isRewatch ?? false,
            },
            include: {
                movie: { select: { id: true, tmdbId: true, title: true, posterPath: true, releaseDate: true } },
            },
        })

        // Logging a film implies it's watched — mark it idempotently (no duplicate entry)
        await prisma.watched.upsert({
            where:  { userId_movieId: { userId, movieId } },
            create: { userId, movieId },
            update: {},
        })

        return res.status(201).json({ data: entry, error: null, message: 'Diary entry created' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const updateDiaryEntry = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id } = req.params
        const { watchedAt, rating, notes, isRewatch } = req.body

        const existing = await prisma.diaryEntry.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Entry not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your entry' })

        const entry = await prisma.diaryEntry.update({
            where: { id },
            data: {
                watchedAt: watchedAt ? new Date(watchedAt) : undefined,
                rating: rating ?? null,
                notes: notes ?? null,
                isRewatch: isRewatch ?? existing.isRewatch,
            },
        })

        return res.json({ data: entry, error: null, message: 'Entry updated' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const deleteDiaryEntry = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { id } = req.params

        const existing = await prisma.diaryEntry.findUnique({ where: { id } })
        if (!existing) return res.status(404).json({ data: null, error: 'Not found', message: 'Entry not found' })
        if (existing.userId !== userId) return res.status(403).json({ data: null, error: 'Forbidden', message: 'Not your entry' })

        await prisma.diaryEntry.delete({ where: { id } })

        return res.json({ data: null, error: null, message: 'Entry deleted' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
