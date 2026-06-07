import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getFilmStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId  = req.user!.id
        const movieId = req.params.movieId

        const [watched, favourite, watchlisted, rating] = await Promise.all([
            prisma.diaryEntry.count({ where: { userId, movieId } }),
            prisma.movieLike.findUnique({ where: { userId_movieId: { userId, movieId } } }),
            prisma.watchlist.findUnique({ where: { userId_movieId: { userId, movieId } } }),
            prisma.rating.findUnique({ where: { userId_movieId: { userId, movieId } } }),
        ])

        return res.json({
            data: {
                watched:     watched > 0,
                favourite:   !!favourite,
                watchlisted: !!watchlisted,
                rating:      rating?.score ?? null,
            },
            error: null,
            message: 'ok',
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const toggleWatched = async (req: AuthRequest, res: Response) => {
    try {
        const userId  = req.user!.id
        const movieId = req.params.movieId

        const entry = await prisma.diaryEntry.create({
            data: { userId, movieId, watchedAt: new Date() },
        })

        return res.status(201).json({ data: entry, error: null, message: 'Logged as watched' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const toggleFavourite = async (req: AuthRequest, res: Response) => {
    try {
        const userId  = req.user!.id
        const movieId = req.params.movieId

        const existing = await prisma.movieLike.findUnique({
            where: { userId_movieId: { userId, movieId } },
        })

        if (existing) {
            await prisma.movieLike.delete({ where: { userId_movieId: { userId, movieId } } })
            return res.json({ data: { favourite: false }, error: null, message: 'Removed from favourites' })
        } else {
            await prisma.movieLike.create({ data: { userId, movieId } })
            return res.json({ data: { favourite: true }, error: null, message: 'Added to favourites' })
        }
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const toggleWatchlist = async (req: AuthRequest, res: Response) => {
    try {
        const userId  = req.user!.id
        const movieId = req.params.movieId

        const existing = await prisma.watchlist.findUnique({
            where: { userId_movieId: { userId, movieId } },
        })

        if (existing) {
            await prisma.watchlist.delete({ where: { userId_movieId: { userId, movieId } } })
            return res.json({ data: { watchlisted: false }, error: null, message: 'Removed from watchlist' })
        } else {
            await prisma.watchlist.create({ data: { userId, movieId } })
            return res.json({ data: { watchlisted: true }, error: null, message: 'Added to watchlist' })
        }
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
