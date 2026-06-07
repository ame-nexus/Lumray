import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { tmdbService } from '../services/tmdb.service'

type TmdbMovie  = { id: number; title: string; poster_path: string | null; release_date?: string }
type TmdbPerson = { id: number; name: string; profile_path: string | null; known_for_department?: string }

export const globalSearch = async (req: Request, res: Response) => {
    try {
        const q    = (req.query.q as string)?.trim()
        const type = (req.query.type as string) ?? 'all'  // all | movies | persons | lists
        const limit = Math.min(20, parseInt(req.query.limit as string) || 6)

        if (!q || q.length < 2) {
            return res.json({ data: { movies: [], persons: [], lists: [] }, error: null, message: 'ok' })
        }

        const wantMovies  = type === 'all' || type === 'movies'
        const wantPersons = type === 'all' || type === 'persons'
        const wantLists   = type === 'all' || type === 'lists'

        const movieLimit  = type === 'movies'  ? limit : 5
        const personLimit = type === 'persons' ? limit : 4
        const listLimit   = type === 'lists'   ? limit : 4

        const [tmdbMovies, tmdbPersons, lists] = await Promise.all([
            wantMovies  ? tmdbService.search(q).catch(() => ({ results: [] }))       : Promise.resolve({ results: [] }),
            wantPersons ? tmdbService.searchPerson(q).catch(() => ({ results: [] })) : Promise.resolve({ results: [] }),
            wantLists
                ? prisma.list.findMany({
                    where: { isPublic: true, name: { contains: q, mode: 'insensitive' } },
                    take: listLimit,
                    include: {
                        user:   { select: { username: true } },
                        _count: { select: { items: true } },
                        items:  { take: 4, include: { movie: { select: { posterPath: true } } } },
                    },
                })
                : Promise.resolve([]),
        ])

        const movies = ((tmdbMovies.results ?? []) as TmdbMovie[])
            .slice(0, movieLimit)
            .map(m => ({
                tmdbId:      m.id,
                title:       m.title,
                posterPath:  m.poster_path ?? null,
                releaseYear: m.release_date?.slice(0, 4) ?? null,
            }))

        const persons = ((tmdbPersons.results ?? []) as TmdbPerson[])
            .slice(0, personLimit)
            .map(p => ({
                tmdbId:      p.id,
                name:        p.name,
                profilePath: p.profile_path ?? null,
                department:  p.known_for_department ?? null,
            }))

        return res.json({ data: { movies, persons, lists }, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
