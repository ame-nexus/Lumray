'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/services/api'
import MovieHero from '@/components/movie/MovieHero'
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

function HeroSkeleton() {
  return (
    <div className="relative min-h-[460px] w-full animate-pulse bg-surface md:min-h-[540px]">
      <div className="absolute inset-0 bg-linear-to-t from-bg to-transparent" />
    </div>
  )
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/api/movies/${id}`)
      .then(res => setMovie(res.data.data))
      .catch(() => setError('Film not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <HeroSkeleton />

  if (error || !movie) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="font-roboto text-text-muted">{error ?? 'Something went wrong'}</p>
      </div>
    )
  }

  const castForSection = movie.cast.map(c => ({
    id: c.id,
    name: c.person.name,
    character: c.character ?? undefined,
    profilePath: c.person.profilePath,
  }))

  const crewForSection = movie.crew.map(c => ({
    id: c.id,
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

        {/* Mobile actions strip — MovieActions self-hides on lg+ */}
        <div className="mb-6 lg:hidden">
          <MovieActions movieId={movie.id} />
        </div>

        <div className="flex gap-8 xl:gap-12">

          {/* LEFT — main content */}
          <div className="min-w-0 flex-1 space-y-10">

            {movie.overview && (
              <p className="font-roboto text-base leading-relaxed text-text-dim max-w-3xl">
                {movie.overview}
              </p>
            )}

            {(castForSection.length > 0 || crewForSection.length > 0) && (
              <CastCrewSection cast={castForSection} crew={crewForSection} />
            )}

            {genreNames.length > 0 && (
              <GenreThemesSection genres={genreNames} />
            )}

            <MovieCommunity movieId={movie.id} reviews={[]} />

            <RecommendedRow movies={[]} />
          </div>

          {/* RIGHT — sidebar, desktop only */}
          <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col gap-4">
            <MovieActions movieId={movie.id} />
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
          </div>

        </div>
      </div>
    </div>
  )
}
