import { prisma } from '../lib/prisma'
import { tmdbService } from './tmdb.service'

interface TmdbMovie {
    id: number
    title: string
    overview: string
    poster_path: string | null
    backdrop_path: string | null
    release_date: string
    original_language: string
    genre_ids: number[]
    popularity: number
    vote_average: number
    vote_count: number
}

async function syncGenres(): Promise<Map<number, string>> {
    const data = await tmdbService.getGenres()
    const genres = data.genres as { id: number; name: string }[]

    await Promise.all(
        genres.map(g =>
            prisma.genre.upsert({
                where: { tmdbId: g.id },
                create: { tmdbId: g.id, name: g.name },
                update: { name: g.name }
            })
        )
    )

    const saved = await prisma.genre.findMany({ select: { id: true, tmdbId: true } })
    return new Map(saved.map((g: { tmdbId: number; id: string }) => [g.tmdbId, g.id]))
}

async function syncMovies(movies: TmdbMovie[], genreMap: Map<number, string>) {
    const chunkSize = 10

    for (let i = 0; i < movies.length; i += chunkSize) {
        const chunk = movies.slice(i, i + chunkSize)

        const results = await Promise.all(
            chunk.map(m =>
                prisma.movie.upsert({
                    where: { tmdbId: m.id },
                    create: {
                        tmdbId: m.id,
                        title: m.title,
                        overview: m.overview ?? '',
                        posterPath: m.poster_path,
                        backdropPath: m.backdrop_path,
                        releaseDate: m.release_date,
                        language: m.original_language,
                        popularity: m.popularity ?? 0,
                        voteAverage: m.vote_average ?? 0,
                        voteCount: m.vote_count ?? 0,
                    },
                    update: {
                        title: m.title,
                        posterPath: m.poster_path,
                        backdropPath: m.backdrop_path,
                        popularity: m.popularity ?? 0,
                        voteAverage: m.vote_average ?? 0,
                        voteCount: m.vote_count ?? 0,
                        cachedAt: new Date(),
                    },
                    select: { id: true, tmdbId: true },
                })
            )
        )

        const rows: { movieId: string; genreId: string }[] = []
        for (const result of results) {
            const src = chunk.find(m => m.id === result.tmdbId)!
            for (const gTmdbId of src.genre_ids ?? []) {
                const genreId = genreMap.get(gTmdbId)
                if (genreId) rows.push({ movieId: result.id, genreId })
            }
        }

        if (rows.length) {
            await prisma.movieGenre.createMany({ data: rows, skipDuplicates: true })
        }

        if (i % 500 === 0 && i > 0) {
            console.log(`  Written ${i} / ${movies.length} movies...`)
        }

        await new Promise(r => setTimeout(r, 100))
    }
}

export async function syncAll(): Promise<void> {
    try {
        await runSync()
    } catch (err: unknown) {
        const code = (err as { code?: string })?.code
        if (code === 'P1017' || code === 'P1001' || code === 'ECONNRESET') {
            console.log(`DB connection error (${code}) during sync, retrying in 8s...`)
            await new Promise(r => setTimeout(r, 8000))
            await runSync()
        } else {
            throw err
        }
    }
}

async function runSync() {
    const latest = await prisma.movie.findFirst({
        orderBy: { cachedAt: 'desc' },
        select: { cachedAt: true }
    })
    if (latest && Date.now() - latest.cachedAt.getTime() < 60 * 60 * 1000) {
        console.log('Sync skipped — data is fresh')
        return
    }

    console.log('Starting TMDb sync...')

    const genreMap = await syncGenres()
    console.log(`Synced ${genreMap.size} genres`)

    const totalPages = 200
    const batchSize = 2
    const batchDelay = 300
    const allMovies: TmdbMovie[] = []

    async function fetchPage(page: number, retries = 4): Promise<{ results: TmdbMovie[] }> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await tmdbService.discover(page)
            } catch (err) {
                if (attempt === retries) throw err
                const wait = attempt * 2000
                console.log(`Page ${page} failed, retrying in ${wait}ms...`)
                await new Promise(r => setTimeout(r, wait))
            }
        }
        throw new Error('unreachable')
    }

    for (let i = 1; i <= totalPages; i += batchSize) {
        const pages = Array.from({ length: Math.min(batchSize, totalPages - i + 1) }, (_, j) => i + j)
        const results = await Promise.all(pages.map(p => fetchPage(p)))
        results.forEach(r => allMovies.push(...(r.results ?? [])))
        console.log(`Fetched pages ${pages[0]}–${pages[pages.length - 1]} (${allMovies.length} movies so far)`)
        await new Promise(r => setTimeout(r, batchDelay))
    }

    const unique = Array.from(new Map(allMovies.map(m => [m.id, m])).values())
    console.log(`Syncing ${unique.length} unique movies...`)

    await syncMovies(unique, genreMap)
    console.log('Sync complete.')
}