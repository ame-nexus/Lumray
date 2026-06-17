import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

export const getFilmStatus = async (req: AuthRequest, res: Response) => {
    try {
        const userId  = req.user!.id
        const movieId = req.params.movieId

        const [watched, favourite, watchlisted, rating] = await Promise.all([
            prisma.watched.findUnique({ where: { userId_movieId: { userId, movieId } } }),
            prisma.movieLike.findUnique({ where: { userId_movieId: { userId, movieId } } }),
            prisma.watchlist.findUnique({ where: { userId_movieId: { userId, movieId } } }),
            prisma.rating.findUnique({ where: { userId_movieId: { userId, movieId } } }),
        ])

        return res.json({
            data: {
                watched:     !!watched,
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

export const getFilmStatusBatch = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id
        const { movieIds } = req.body as { movieIds?: unknown }

        if (!Array.isArray(movieIds) || movieIds.length === 0) {
            return res.json({ data: {}, error: null, message: 'ok' })
        }

        const ids = [...new Set(movieIds.filter((x): x is string => typeof x === 'string'))].slice(0, 200)
        if (ids.length === 0) return res.json({ data: {}, error: null, message: 'ok' })

        const [watchedRows, favRows, watchlistRows, ratingRows] = await Promise.all([
            prisma.watched.findMany({ where: { userId, movieId: { in: ids } }, select: { movieId: true } }),
            prisma.movieLike.findMany({ where: { userId, movieId: { in: ids } }, select: { movieId: true } }),
            prisma.watchlist.findMany({ where: { userId, movieId: { in: ids } }, select: { movieId: true } }),
            prisma.rating.findMany({ where: { userId, movieId: { in: ids } }, select: { movieId: true, score: true } }),
        ])

        const watchedSet   = new Set(watchedRows.map(r => r.movieId))
        const favSet       = new Set(favRows.map(r => r.movieId))
        const watchlistSet = new Set(watchlistRows.map(r => r.movieId))
        const ratingMap    = new Map(ratingRows.map(r => [r.movieId, r.score]))

        const data: Record<string, { watched: boolean; favourite: boolean; watchlisted: boolean; rating: number | null }> = {}
        for (const id of ids) {
            data[id] = {
                watched:     watchedSet.has(id),
                favourite:   favSet.has(id),
                watchlisted: watchlistSet.has(id),
                rating:      ratingMap.get(id) ?? null,
            }
        }

        return res.json({ data, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const toggleWatched = async (req: AuthRequest, res: Response) => {
    try {
        const userId  = req.user!.id
        const movieId = req.params.movieId

        const existing = await prisma.watched.findUnique({
            where: { userId_movieId: { userId, movieId } },
        })

        if (existing) {
            await prisma.watched.delete({ where: { userId_movieId: { userId, movieId } } })
            return res.json({ data: { watched: false }, error: null, message: 'Removed from watched' })
        } else {
            await prisma.watched.create({ data: { userId, movieId } })
            return res.json({ data: { watched: true }, error: null, message: 'Marked as watched' })
        }
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
