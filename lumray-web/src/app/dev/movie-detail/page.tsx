'use client'

import MovieActions, { DUMMY_MOVIE_ACTIONS } from '@/components/movie/MovieActions'
import MovieRating, { DUMMY_RATING } from '@/components/movie/MovieRating'
import MovieInfo, { DUMMY_MOVIE_INFO } from '@/components/movie/MovieInfo'
import CastCrewSection, { DUMMY_CAST_CREW } from '@/components/movie/CastCrewSection'
import GenreThemesSection, { DUMMY_GENRE_THEMES } from '@/components/movie/GenreThemesSection'
import MovieCommunity, { DUMMY_MOVIE_COMMUNITY } from '@/components/movie/MovieCommunity'
import RecommendedRow, { DUMMY_RECOMMENDED } from '@/components/movie/RecommendedRow'

export default function MovieDetailDevPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 font-outfit text-2xl font-semibold text-purple-light">
        Movie detail components (dev)
      </h1>
      <p className="mb-8 font-roboto text-sm text-text-muted">
        Layout preview — Omar wires the real page. Hero is not included.
      </p>

      {/* Mobile order: actions strip first */}
      <div className="mb-6 lg:hidden">
        <MovieActions {...DUMMY_MOVIE_ACTIONS} />
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1 space-y-10">
          <p className="font-roboto text-sm leading-relaxed text-text-dim">
            Overview placeholder — Omar adds synopsis here. Sophie and Calum joyfully live their
            last summer at a vacation facility as a darker future encroaches.
          </p>

          <CastCrewSection {...DUMMY_CAST_CREW} />
          <GenreThemesSection {...DUMMY_GENRE_THEMES} />
          <div className="space-y-4 lg:hidden">
            <MovieRating {...DUMMY_RATING} />
            <MovieInfo {...DUMMY_MOVIE_INFO} />
          </div>
          <MovieCommunity {...DUMMY_MOVIE_COMMUNITY} />
          <RecommendedRow movies={DUMMY_RECOMMENDED} />
        </div>

        <aside className="hidden w-80 shrink-0 space-y-4 lg:block">
          <MovieActions {...DUMMY_MOVIE_ACTIONS} />
          <MovieRating {...DUMMY_RATING} />
          <MovieInfo {...DUMMY_MOVIE_INFO} />
        </aside>
      </div>
    </main>
  )
}
