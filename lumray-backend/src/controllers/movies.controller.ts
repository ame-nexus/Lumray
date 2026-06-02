import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { tmdbService } from '../services/tmdb.service'

export const getTopRated = async (req: Request, res: Response) => {
    try {
        const topRated = await tmdbService.getTopRated()
        const filtered = topRated.results.filter((movie: { vote_count: number }) => movie.vote_count >= 5000)
        return res.json({ data: filtered, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getByGenre = async (req: Request, res: Response) => {
    try {
        const genreId = parseInt(req.params.genreId as string)
        const movie = await tmdbService.getByGenre(genreId)
        return res.json({ data: movie.results, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const getMovieDetail = async (req: Request, res: Response) => {
    try {
        const tmdbId = parseInt(req.params.id as string)
        if (isNaN(tmdbId)) return res.status(400).json({ data: null, error: 'Invalid id', message: 'id must be a number' })

        // Check if movie already has cast cached
        const existing = await prisma.movie.findUnique({
            where: { tmdbId },
            select: { id: true, cast: { select: { id: true }, take: 1 } }
        })

        if (!existing || existing.cast.length === 0) {
            // Fetch full details + credits from TMDb
            const tmdb = await tmdbService.getMovieDetail(tmdbId)

            // Upsert movie with all detail fields
            const saved = await prisma.movie.upsert({
                where: { tmdbId },
                create: {
                    tmdbId: tmdb.id,
                    title: tmdb.title,
                    overview: tmdb.overview ?? '',
                    tagline: tmdb.tagline ?? null,
                    posterPath: tmdb.poster_path ?? null,
                    backdropPath: tmdb.backdrop_path ?? null,
                    runtime: tmdb.runtime ?? null,
                    releaseDate: tmdb.release_date ?? null,
                    language: tmdb.original_language ?? null,
                    status: tmdb.status ?? null,
                    popularity: tmdb.popularity ?? 0,
                    voteAverage: tmdb.vote_average ?? 0,
                    voteCount: tmdb.vote_count ?? 0,
                },
                update: {
                    tagline: tmdb.tagline ?? null,
                    runtime: tmdb.runtime ?? null,
                    status: tmdb.status ?? null,
                    popularity: tmdb.popularity ?? 0,
                    voteAverage: tmdb.vote_average ?? 0,
                    voteCount: tmdb.vote_count ?? 0,
                    cachedAt: new Date(),
                },
                select: { id: true }
            })

            // Sync genres
            const tmdbGenres = (tmdb.genres ?? []) as { id: number; name: string }[]
            await Promise.all(tmdbGenres.map(g =>
                prisma.genre.upsert({
                    where: { tmdbId: g.id },
                    create: { tmdbId: g.id, name: g.name },
                    update: { name: g.name }
                })
            ))
            const genreRecords = await prisma.genre.findMany({
                where: { tmdbId: { in: tmdbGenres.map(g => g.id) } },
                select: { id: true, tmdbId: true }
            })
            await prisma.movieGenre.createMany({
                data: genreRecords.map(g => ({ movieId: saved.id, genreId: g.id })),
                skipDuplicates: true
            })

            // Prepare cast + key crew
            type TmdbCast = { id: number; name: string; character?: string; order?: number; profile_path?: string | null }
            type TmdbCrew = { id: number; name: string; job: string; department: string; profile_path?: string | null }

            const KEY_JOBS = ['Director', 'Writer', 'Screenplay', 'Director of Photography', 'Original Music Composer', 'Producer']

            const castData: TmdbCast[] = ((tmdb.credits?.cast ?? []) as TmdbCast[])
                .slice(0, 20)
                .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)

            const crewData: TmdbCrew[] = ((tmdb.credits?.crew ?? []) as TmdbCrew[])
                .filter(c => KEY_JOBS.includes(c.job))
                .filter((c, i, arr) => arr.findIndex(x => x.id === c.id && x.job === c.job) === i)

            // Upsert all persons
            await Promise.all([...castData, ...crewData].map(p =>
                prisma.person.upsert({
                    where: { tmdbId: p.id },
                    create: { tmdbId: p.id, name: p.name, profilePath: p.profile_path ?? null },
                    update: { name: p.name, profilePath: p.profile_path ?? null }
                })
            ))

            const personRecords = await prisma.person.findMany({
                where: { tmdbId: { in: [...castData, ...crewData].map(p => p.id) } },
                select: { id: true, tmdbId: true }
            })
            const personMap = new Map(personRecords.map(p => [p.tmdbId, p.id]))

            // Create cast + crew records
            await Promise.all([
                prisma.movieCast.createMany({
                    data: castData
                        .filter(c => personMap.has(c.id))
                        .map(c => ({
                            movieId: saved.id,
                            personId: personMap.get(c.id)!,
                            character: c.character ?? null,
                            order: c.order ?? 0,
                        })),
                    skipDuplicates: true
                }),
                prisma.movieCrew.createMany({
                    data: crewData
                        .filter(c => personMap.has(c.id))
                        .map(c => ({
                            movieId: saved.id,
                            personId: personMap.get(c.id)!,
                            job: c.job,
                            department: c.department,
                        })),
                    skipDuplicates: true
                })
            ])
        }

        // Fetch full movie with all relations
        const movie = await prisma.movie.findUnique({
            where: { tmdbId },
            include: {
                genres: { select: { genre: { select: { name: true } } } },
                cast: {
                    include: { person: { select: { id: true, tmdbId: true, name: true, profilePath: true } } },
                    orderBy: { order: 'asc' },
                    take: 20,
                },
                crew: {
                    include: { person: { select: { id: true, tmdbId: true, name: true, profilePath: true } } },
                },
                _count: { select: { ratings: true, reviews: true, diaryEntries: true } }
            }
        })

        return res.json({ data: movie, error: null, message: 'ok' })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}

export const browseMovies = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1)
        const limit = Math.min(60, Math.max(1, parseInt(req.query.limit as string) || 24))
        const sort = (req.query.sort as string) || 'popular'

        const genresParam    = req.query.genres    as string | undefined
        const yearsParam     = req.query.years     as string | undefined
        const decadesParam   = req.query.decades   as string | undefined
        const languagesParam = req.query.languages as string | undefined
        const runtimeParam   = req.query.runtime   as string | undefined

        const genres    = genresParam    ? genresParam.split(',').map(s => s.trim()).filter(Boolean) : []
        const years     = yearsParam     ? yearsParam.split(',').map(s => s.trim()).filter(Boolean) : []
        const decades   = decadesParam   ? decadesParam.split(',').map(s => s.trim()).filter(Boolean) : []
        const languages = languagesParam ? languagesParam.split(',').map(s => s.trim()).filter(Boolean) : []
        const runtimes  = runtimeParam   ? runtimeParam.split(',').map(s => s.trim()).filter(Boolean) : []

        // AND across filter types, OR within each type
        const andClauses: Prisma.MovieWhereInput[] = []

        if (genres.length) {
            andClauses.push({
                genres: { some: { genre: { name: { in: genres } } } }
            })
        }

        // Merge explicit years + decade expansions into one OR list
        const yearStarts: string[] = [...years]
        for (const d of decades) {
            const start = parseInt(d) // "2010s" → 2010
            if (!isNaN(start)) {
                for (let y = start; y < start + 10; y++) {
                    yearStarts.push(String(y))
                }
            }
        }
        if (yearStarts.length) {
            andClauses.push({
                OR: yearStarts.map(y => ({ releaseDate: { startsWith: y } }))
            })
        }

        if (languages.length) {
            andClauses.push({ language: { in: languages } })
        }

        if (runtimes.length) {
            const RUNTIME_RANGES: Record<string, Prisma.MovieWhereInput> = {
                'Under 90 min':  { runtime: { lte: 90 } },
                '90–120 min':    { runtime: { gte: 90,  lte: 120 } },
                '120–180 min':   { runtime: { gte: 120, lte: 180 } },
                'Over 180 min':  { runtime: { gte: 180 } },
            }
            const runtimeConditions = runtimes
                .map(r => RUNTIME_RANGES[r])
                .filter(Boolean)
            if (runtimeConditions.length) {
                andClauses.push({ OR: runtimeConditions })
            }
        }

        const where: Prisma.MovieWhereInput = andClauses.length ? { AND: andClauses } : {}

        let orderBy: Prisma.MovieOrderByWithRelationInput | Prisma.MovieOrderByWithRelationInput[]
        switch (sort) {
            case 'top-rated':    orderBy = { voteAverage: 'desc' };  break
            case 'new-releases': orderBy = { releaseDate: 'desc' };  break
            case 'a-z':          orderBy = { title: 'asc' };         break
            case 'shortest':     orderBy = { runtime: 'asc' };       break
            case 'longest':      orderBy = { runtime: 'desc' };      break
            default:             orderBy = { popularity: 'desc' }
        }

        const [movies, total] = await Promise.all([
            prisma.movie.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    tmdbId: true,
                    title: true,
                    posterPath: true,
                    releaseDate: true,
                    voteAverage: true,
                    voteCount: true,
                    popularity: true,
                    genres: { select: { genre: { select: { name: true } } } }
                }
            }),
            prisma.movie.count({ where })
        ])

        return res.json({
            data: { movies, total, page, totalPages: Math.ceil(total / limit) },
            error: null,
            message: 'ok'
        })
    } catch (error) {
        return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
    }
}
