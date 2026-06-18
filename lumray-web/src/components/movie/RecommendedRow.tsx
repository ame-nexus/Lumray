'use client'

import MoviePoster from '@/components/films/MoviePoster'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface RecommendedMovie {
  tmdbId: number
  title: string
  posterPath: string | null
  year?: string | number
  voteAverage?: number
  voteCount?: number
}

export interface RecommendedRowProps {
  movies: RecommendedMovie[]
}

export default function RecommendedRow({ movies }: RecommendedRowProps) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  return (
    <section>
      <div className="mb-4">
        <h2 className="font-outfit text-xl font-bold text-text">
          {t.movie.similar}
        </h2>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-1 lg:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {movies.map((movie) => (
          <div key={movie.tmdbId} className="min-w-35 shrink-0">
            <MoviePoster id={movie.tmdbId} title={movie.title} posterPath={movie.posterPath} year={String(movie.year ?? '')} rating={movie.voteAverage ? movie.voteAverage / 2 : undefined} sizes="140px" />
          </div>
        ))}
      </div>

      <div className="hidden grid-cols-4 gap-4 lg:grid">
        {movies.slice(0, 4).map((movie) => (
          <MoviePoster key={movie.tmdbId} id={movie.tmdbId} title={movie.title} posterPath={movie.posterPath} year={String(movie.year ?? '')} rating={movie.voteAverage ? movie.voteAverage / 2 : undefined} />
        ))}
      </div>
    </section>
  )
}

export const DUMMY_RECOMMENDED: RecommendedMovie[] = [
  {
    id: 502033,
    title: 'Sound of Metal',
    posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg',
    year: 2019,
    rating: 4.2,
    ratingCount: 2400,
  },
  {
    id: 2449,
    title: 'Lilya 4-ever',
    posterPath: '/8YZKuT42p3ZiQ6jaZGBv5PX8b2n.jpg',
    year: 2002,
    rating: 4.0,
    ratingCount: 890,
  },
  {
    id: 334541,
    title: 'Manchester by the Sea',
    posterPath: '/6JgSiYp7QoaUlmefY2aT7fiAe0H.jpg',
    year: 2016,
    rating: 4.3,
    ratingCount: 5200,
  },
  {
    id: 641,
    title: 'Requiem for a Dream',
    posterPath: '/5ZWgHTxGWDVChtOLTCZH7dMiw9.jpg',
    year: 2000,
    rating: 4.1,
    ratingCount: 6100,
  },
]
