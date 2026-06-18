import { notFound } from 'next/navigation'
import MovieHero from '@/components/movie/MovieHero'
import MovieOverview from '@/components/movie/MovieOverview'
import SoundtrackSection from '@/components/movie/SoundtrackSection'
import {
  CastCrewSection,
  GenreThemesSection,
  MovieActions,
  MovieCommunity,
  MovieInfo,
  MovieRating,
  RecommendedRow,
} from '@/components/movie'

interface MovieDetail {
  id: string
  tmdbId: number
  title: string
  overview: string
  tagline?: string | null
  posterPath?: string | null
  backdropPath?: string | null
  runtime?: number | null
  releaseDate?: string | null
  language?: string | null
  status?: string | null
  keywords: string[]
  voteAverage: number
  voteCount: number
  genres: { genre: { name: string } }[]
  cast: {
    id: string
    character?: string | null
    order: number
    person: { id: string; tmdbId: number; name: string; profilePath?: string | null }
  }[]
  crew: {
    id: string
    job: string
    department: string
    person: { id: string; tmdbId: number; name: string; profilePath?: string | null }
  }[]
  _count: { ratings: number; reviews: number; diaryEntries: number }
}

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English', fr: 'French', ja: 'Japanese', ko: 'Korean',
  es: 'Spanish', it: 'Italian', de: 'German', hi: 'Hindi',
  pt: 'Portuguese', zh: 'Chinese', ar: 'Arabic', ru: 'Russian',
}

async function getMovie(id: string): Promise<MovieDetail | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${id}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

async function getSimilarMovies(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${id}/similar`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

async function getSoundtrack(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${id}/soundtrack`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [movie, similar, soundtrack] = await Promise.all([
    getMovie(id),
    getSimilarMovies(id),
    getSoundtrack(id),
  ])

  if (!movie) notFound()

  const castForSection = movie.cast.map(c => ({
    id: c.id,
    tmdbId: c.person.tmdbId,
    name: c.person.name,
    character: c.character ?? undefined,
    profilePath: c.person.profilePath,
  }))

  const crewForSection = movie.crew.map(c => ({
    id: c.id,
    tmdbId: c.person.tmdbId,
    name: c.person.name,
    job: c.job,
    profilePath: c.person.profilePath,
  }))

  const genreNames = movie.genres.map(g => g.genre.name)

  const director = movie.crew.find(c => c.job === 'Director')?.person.name
  const writers = movie.crew
    .filter(c => c.job === 'Writer' || c.job === 'Screenplay')
    .map(c => c.person.name)
  const cinematography = movie.crew.find(c => c.job === 'Director of Photography')?.person.name
  const music = movie.crew.find(c => c.job === 'Original Music Composer')?.person.name
  const language = movie.language
    ? (LANGUAGE_MAP[movie.language] ?? movie.language.toUpperCase())
    : undefined

  const ratingAverage = movie.voteAverage / 2

  return (
    <div>
      <MovieHero
        title={movie.title}
        tagline={movie.tagline}
        posterPath={movie.posterPath}
        backdropPath={movie.backdropPath}
        releaseDate={movie.releaseDate}
        runtime={movie.runtime}
        language={movie.language}
        voteAverage={movie.voteAverage}
        voteCount={movie.voteCount}
        genres={movie.genres}
        crew={movie.crew}
      />

      <div className="px-6 md:px-12 xl:px-60 pb-16">
        <div className="flex gap-6 lg:gap-8 xl:gap-10">

          {/* LEFT — main content */}
          <div className="min-w-0 flex-1 space-y-10">

            {movie.overview && (
              <MovieOverview tmdbId={movie.tmdbId} overview={movie.overview} />
            )}

            {/* Inline actions card — mobile/tablet only */}
            <div className="lg:hidden space-y-4">
              <MovieActions
                movieId={movie.id}
                movieTitle={movie.title}
                posterPath={movie.posterPath}
                releaseDate={movie.releaseDate}
                director={director}
                mobileInline
                writers={writers.length ? writers : undefined}
                cinematography={cinematography}
                music={music}
                runtime={movie.runtime}
                language={language}
                released={movie.releaseDate ?? undefined}
              />
              <MovieRating
                average={ratingAverage}
                totalCount={movie.voteCount}
                distribution={[]}
              />
              {soundtrack && (
                <SoundtrackSection
                  tracks={soundtrack.tracks}
                  albumName={soundtrack.albumName}
                  albumUrl={soundtrack.albumUrl}
                  albumImage={soundtrack.albumImage}
                  totalTracks={soundtrack.totalTracks}
                />
              )}
            </div>

            {(castForSection.length > 0 || crewForSection.length > 0) && (
              <CastCrewSection cast={castForSection} crew={crewForSection} />
            )}

            {genreNames.length > 0 && (
              <GenreThemesSection genres={genreNames} themes={movie.keywords} />
            )}

            <MovieCommunity movieId={movie.id} tmdbId={movie.tmdbId} reviews={[]} />

            <RecommendedRow movies={similar} />
          </div>

          {/* RIGHT — sidebar, desktop only */}
          <div className="hidden lg:flex w-60 xl:w-72 2xl:w-80 shrink-0 flex-col gap-4 sticky top-25 self-start">
            <MovieActions movieId={movie.id} movieTitle={movie.title} />
            <MovieRating
              average={ratingAverage}
              totalCount={movie.voteCount}
              distribution={[]}
            />
            <MovieInfo
              director={director}
              writers={writers.length ? writers : undefined}
              cinematography={cinematography}
              music={music}
              runtime={movie.runtime ?? undefined}
              language={language}
              released={movie.releaseDate ?? undefined}
            />
            {soundtrack && (
              <SoundtrackSection
                tracks={soundtrack.tracks}
                albumName={soundtrack.albumName}
                albumUrl={soundtrack.albumUrl}
                albumImage={soundtrack.albumImage}
                totalTracks={soundtrack.totalTracks}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
