'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/services/api'
import MovieHero from '@/components/movie/MovieHero'

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

function HeroSkeleton() {
  return (
    <div className="relative h-72 w-full animate-pulse bg-surface md:h-96">
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

      {/* Overview */}
      {movie.overview && (
        <div className="px-6 md:px-12 xl:px-60 py-10">
          <p className="font-roboto text-base leading-relaxed text-text-dim max-w-3xl">
            {movie.overview}
          </p>
        </div>
      )}

      {/* Teammate components go here once built */}
      {/* <CastCrewSection cast={movie.cast} crew={movie.crew} /> */}
      {/* <GenreThemesSection genres={...} /> */}
      {/* <MovieCommunity movieId={movie.id} reviews={[]} /> */}
    </div>
  )
}
