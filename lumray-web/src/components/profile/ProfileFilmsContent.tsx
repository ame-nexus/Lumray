'use client'

import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import MoviePoster from '@/components/films/MoviePoster'
import DiaryPagination from '@/components/profile/DiaryPagination'
import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'

interface ProfileFilm {
  id: number
  title: string
  posterPath: string | null
  year?: number
}

interface ProfileFilmsContentProps {
  films: ProfileFilm[]
  totalCount?: number
}

const GENRES = [
  'All genres',
  'Drama',
  'Action',
  'Thriller',
  'Animation',
  'Romance',
  'Comedy',
  'Sci-fi',
]

const PAGE_SIZE = 18

export default function ProfileFilmsContent({
  films,
  totalCount,
}: ProfileFilmsContentProps) {
  const [activeGenre, setActiveGenre] = useState('All genres')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  const filtered =
    activeGenre === 'All genres'
      ? films
      : films.filter((f) => f.title.toLowerCase().includes(activeGenre.toLowerCase().slice(0, 3)))

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <ProfileTwoColumn
      main={
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    setActiveGenre(genre)
                    setPage(1)
                  }}
                  className={[
                    'rounded-full border px-3 py-1 font-roboto text-xs transition-colors',
                    activeGenre === genre
                      ? 'border-purple bg-purple text-white'
                      : 'border-text/15 text-text-muted hover:text-text',
                  ].join(' ')}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-purple px-3 py-1.5 font-roboto text-sm text-white"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-label="Grid view"
                className={view === 'grid' ? 'text-purple-light' : 'text-text-muted'}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-label="List view"
                className={view === 'list' ? 'text-purple-light' : 'text-text-muted'}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-surface px-4 py-2">
            <p className="font-roboto text-sm text-text-muted">
              {(totalCount ?? films.length).toLocaleString()} films
            </p>
          </div>

          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
                : 'flex flex-col gap-3'
            }
          >
            {paged.map((film) => (
              <MoviePoster
                key={film.id}
                id={film.id}
                title={film.title}
                posterPath={film.posterPath}
                year={film.year}
              />
            ))}
          </div>

          <DiaryPagination
            hasPrev={safePage > 1}
            hasNext={safePage < pageCount}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
          />
        </>
      }
    />
  )
}
