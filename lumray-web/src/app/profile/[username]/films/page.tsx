'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import MoviePoster from '@/components/films/MoviePoster'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import { useHydrateFilmStatuses } from '@/hooks/useFilmStatuses'
import api from '@/services/api'

const GENRES = ['All genres', 'Drama', 'Action', 'Thriller', 'Animation', 'Romance', 'Comedy', 'Science Fiction', 'Horror', 'Crime', 'Documentary', 'Fantasy']

interface ProfileFilm {
  id: string
  tmdbId: number
  title: string
  posterPath: string | null
  year: string | null
  rating: number | null
}

export default function ProfileFilmsPage() {
  return (
    <Suspense fallback={null}>
      <ProfileFilmsPageContent />
    </Suspense>
  )
}

function ProfileFilmsPageContent() {
  const params       = useParams()
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const username     = params.username as string
  const lang         = useLanguageStore(s => s.lang)
  const t            = useT(lang)

  const page        = parseInt(searchParams.get('page') || '1', 10)
  const activeGenre = searchParams.get('genre') || 'All genres'

  const [films,      setFilms]      = useState<ProfileFilm[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)

  function updateParams(updates: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) p.delete(k)
      else p.set(k, v)
    }
    router.replace(`${pathname}?${p.toString()}`)
  }

  const fetchFilms = useCallback(() => {
    setLoading(true)
    const params: Record<string, string> = { page: String(page), limit: '24' }
    if (activeGenre !== 'All genres') params.genre = activeGenre
    api.get(`/api/users/${username}/films`, { params })
      .then(res => {
        setFilms(res.data.data.films)
        setTotal(res.data.data.total)
        setTotalPages(res.data.data.totalPages)
      })
      .catch(() => setFilms([]))
      .finally(() => setLoading(false))
  }, [username, page, activeGenre])

  useEffect(() => { fetchFilms() }, [fetchFilms])

  useHydrateFilmStatuses(films.map(f => f.id))

  return (
    <div className="px-6 md:px-12 xl:px-60 py-8 space-y-6">

      {/* Genre pills + filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => updateParams({ genre: genre === 'All genres' ? null : genre, page: null })}
              className={`rounded-full border px-3 py-1 font-roboto text-xs transition-colors ${
                activeGenre === genre
                  ? 'border-purple bg-purple text-white'
                  : 'border-text/15 text-text-muted hover:text-text'
              }`}
            >
              {genre === 'All genres' ? t.profile.allGenres : genre}
            </button>
          ))}
          <button className="flex items-center gap-1 rounded-full border border-text/15 px-3 py-1 font-roboto text-xs text-text-muted hover:text-text">
            <ChevronDown size={12} />
          </button>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-purple px-3 py-1.5 font-roboto text-sm text-white hover:bg-purple-deep">
          <SlidersHorizontal size={14} />
          {t.profile.filter}
        </button>
      </div>

      {/* Count bar */}
      {!loading && (
        <div className="rounded-lg bg-surface px-4 py-2">
          <p className="font-roboto text-sm text-text-muted">
            {total.toLocaleString()} {t.profile.filmsCount}
          </p>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 md:gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      ) : films.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-roboto text-text-muted">{t.profile.noFilms}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 md:gap-3">
          {films.map(film => (
            <MoviePoster
              key={film.id}
              id={film.tmdbId}
              dbId={film.id}
              title={film.title}
              posterPath={film.posterPath}
              year={film.year ?? undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
          disabled={page === 1}
          className="rounded-full border border-text/20 px-6 py-2 font-roboto text-sm text-text disabled:opacity-30 hover:border-text/40"
        >
          {t.films.prev}
        </button>
        <span className="font-roboto text-sm text-text-muted">{t.films.page} {page} {t.films.of} {totalPages}</span>
        <button
          onClick={() => updateParams({ page: String(page + 1) })}
          disabled={page >= totalPages}
          className="rounded-full bg-purple px-6 py-2 font-roboto text-sm text-white disabled:opacity-30 hover:bg-purple-deep"
        >
          {t.films.next}
        </button>
      </div>
    </div>
  )
}
