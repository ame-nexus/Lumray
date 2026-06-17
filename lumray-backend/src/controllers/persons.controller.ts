import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { tmdbService } from '../services/tmdb.service'

interface RoleGroup {
  job: string          // 'Actor', 'Director', 'Writer', etc.
  movies: {
    tmdbId: number
    title: string
    posterPath: string | null
    releaseDate: string | null
    detail: string     // character name for cast, job title for crew
  }[]
}

export const getPersonDetail = async (req: Request, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.id as string)
    if (isNaN(tmdbId)) return res.status(400).json({ data: null, error: 'Invalid id', message: 'id must be a number' })

    // Check DB first
    const dbPerson = await prisma.person.findUnique({
      where: { tmdbId },
      include: {
        cast: {
          include: { movie: { select: { tmdbId: true, title: true, posterPath: true, releaseDate: true } } },
          orderBy: { order: 'asc' },
          take: 30,
        },
        crew: {
          include: { movie: { select: { tmdbId: true, title: true, posterPath: true, releaseDate: true } } },
          take: 50,
        },
      },
    })

    let name       = dbPerson?.name ?? ''
    let biography     = dbPerson?.biography ?? null
    let birthday      = dbPerson?.birthday ?? null
    let deathday      = dbPerson?.deathday ?? null
    let profilePath   = dbPerson?.profilePath ?? null
    let placeOfBirth  = dbPerson?.placeOfBirth ?? null
    let roles: RoleGroup[] = []

    // Only use DB data if we have both credits AND biography already fetched
    if (dbPerson && (dbPerson.cast.length > 0 || dbPerson.crew.length > 0) && dbPerson.biography) {
      // Build roles from DB
      const roleMap = new Map<string, RoleGroup>()

      if (dbPerson.cast.length > 0) {
        roleMap.set('Actor', {
          job: 'Actor',
          movies: dbPerson.cast.map(c => ({
            tmdbId:      c.movie.tmdbId,
            title:       c.movie.title,
            posterPath:  c.movie.posterPath,
            releaseDate: c.movie.releaseDate,
            detail:      c.character ?? '',
          })),
        })
      }

      for (const c of dbPerson.crew) {
        const job = c.job
        if (!roleMap.has(job)) roleMap.set(job, { job, movies: [] })
        roleMap.get(job)!.movies.push({
          tmdbId:      c.movie.tmdbId,
          title:       c.movie.title,
          posterPath:  c.movie.posterPath,
          releaseDate: c.movie.releaseDate,
          detail:      job,
        })
      }

      roles = Array.from(roleMap.values())
    } else {
      // Fetch from TMDb for full credits
      let tmdb: Record<string, unknown>
      try {
        tmdb = await tmdbService.getPerson(tmdbId)
      } catch {
        // TMDb unavailable — return whatever we have in the DB
        if (dbPerson) {
          return res.json({ data: { tmdbId, name: dbPerson.name, biography: dbPerson.biography, birthday: dbPerson.birthday, deathday: dbPerson.deathday, profilePath: dbPerson.profilePath, roles: [] }, error: null, message: 'ok' })
        }
        return res.status(503).json({ data: null, error: 'Service unavailable', message: 'Could not fetch person data' })
      }
      name         = tmdb.name as string
      biography    = (tmdb.biography as string) ?? null
      birthday     = (tmdb.birthday as string) ?? null
      deathday     = (tmdb.deathday as string) ?? null
      profilePath  = (tmdb.profile_path as string) ?? null
      placeOfBirth = (tmdb.place_of_birth as string) ?? null

      // Cache full person details in DB so future visits never call TMDb
      await prisma.person.upsert({
        where: { tmdbId },
        create: { tmdbId, name, biography, birthday, deathday, placeOfBirth, profilePath },
        update: { name, biography, birthday, deathday, placeOfBirth, profilePath },
      }).catch(() => {}) // non-fatal — page still loads

      type TmdbCredit = { id: number; title: string; poster_path: string | null; release_date: string; character?: string; job?: string; vote_count: number }

      const credits = tmdb.movie_credits as { cast?: TmdbCredit[]; crew?: TmdbCredit[] } | undefined
      const castMovies: TmdbCredit[] = credits?.cast ?? []
      const crewMovies: TmdbCredit[] = credits?.crew ?? []

      // Filter to notable films only
      const notableCast = castMovies
        .filter((m: TmdbCredit) => m.vote_count > 100)
        .sort((a: TmdbCredit, b: TmdbCredit) => b.vote_count - a.vote_count)
        .slice(0, 24)

      if (notableCast.length > 0) {
        roles.push({
          job: 'Actor',
          movies: notableCast.map((m: TmdbCredit) => ({
            tmdbId:      m.id,
            title:       m.title,
            posterPath:  m.poster_path,
            releaseDate: m.release_date,
            detail:      m.character ?? '',
          })),
        })
      }

      // Group crew by job
      const crewByJob = new Map<string, TmdbCredit[]>()
      for (const c of crewMovies) {
        if (!c.job) continue
        if (!crewByJob.has(c.job)) crewByJob.set(c.job, [])
        crewByJob.get(c.job)!.push(c)
      }

      // Keep only notable jobs with enough films
      const PRIORITY_JOBS = ['Director', 'Writer', 'Screenplay', 'Producer', 'Director of Photography', 'Original Music Composer', 'Editor']
      for (const job of PRIORITY_JOBS) {
        const movies = crewByJob.get(job)
        if (!movies || movies.length === 0) continue
        roles.push({
          job,
          movies: movies
            .sort((a, b) => b.vote_count - a.vote_count)
            .slice(0, 24)
            .map(m => ({ tmdbId: m.id, title: m.title, posterPath: m.poster_path, releaseDate: m.release_date, detail: job })),
        })
      }
    }

    // Sort roles: Actor first, then others
    roles.sort((a, b) => {
      if (a.job === 'Actor') return -1
      if (b.job === 'Actor') return 1
      return a.job.localeCompare(b.job)
    })

    return res.json({
      data: { tmdbId, name, biography, birthday, deathday, placeOfBirth, profilePath, roles },
      error: null,
      message: 'ok',
    })
  } catch (error) {
    return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
  }
}

export const getPersonTranslation = async (req: Request, res: Response) => {
  try {
    const tmdbId = parseInt(req.params.id as string)
    if (isNaN(tmdbId)) return res.status(400).json({ data: null, error: 'Invalid id', message: 'id must be a number' })
    const lang = (req.query.lang as string) || 'en'
    const allowedLangs = ['fr', 'ar', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'zh']
    if (!allowedLangs.includes(lang)) return res.status(400).json({ data: null, error: 'Invalid lang', message: 'Unsupported language' })
    const tmdb = await tmdbService.getPersonTranslation(tmdbId, lang)
    return res.json({
      data: { biography: (tmdb.biography as string) || null },
      error: null,
      message: 'ok',
    })
  } catch (error) {
    return res.status(500).json({ data: null, error: 'Server error', message: String(error) })
  }
}
