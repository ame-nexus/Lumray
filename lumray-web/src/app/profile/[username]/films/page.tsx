'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, ArrowUpDown, ChevronDown, Check } from 'lucide-react'
import MoviePoster from '@/components/films/MoviePoster'
import FilterModal, { type ModalFilters } from '@/components/films/FilterModal'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import { useHydrateFilmStatuses } from '@/hooks/useFilmStatuses'
import api from '@/services/api'

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Title A–Z',    value: 'a-z'    },
  { label: 'Title Z–A',    value: 'z-a'    },
]

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

  const page = parseInt(searchParams.get('page') || '1', 10)
  const sort = searchParams.get('sort') || 'newest'

  const modalFilters: ModalFilters = {
    genres:    searchParams.get('fg')?.split(',').filter(Boolean) ?? [],
    decades:   searchParams.get('fd')?.split(',').filter(Boolean) ?? [],
    languages: searchParams.get('fl')?.split(',').filter(Boolean) ?? [],
    runtime:   searchParams.get('fr')?.split(',').filter(Boolean) ?? [],
  }
  const activeFilterCount =
    modalFilters.genres.length + modalFilters.decades.length +
    modalFilters.languages.length + modalFilters.runtime.length

  const [films,      setFilms]      = useState<ProfileFilm[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [sortOpen,   setSortOpen]   = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  function updateParams(updates: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) p.delete(k)
      else p.set(k, v)
    }
    router.replace(`${pathname}?${p.toString()}`)
  }

  function applyFilters(f: ModalFilters) {
    updateParams({
      fg:   f.genres.length    ? f.genres.join(',')    : null,
      fd:   f.decades.length   ? f.decades.join(',')   : null,
      fl:   f.languages.length ? f.languages.join(',') : null,
      fr:   f.runtime.length   ? f.runtime.join(',')   : null,
      page: null,
    })
  }

  const fetchFilms = useCallback(() => {
    setLoading(true)
    const qp: Record<string, string> = { page: String(page), limit: '24', sort }
    if (modalFilters.genres.length)    qp.fg = modalFilters.genres.join(',')
    if (modalFilters.decades.length)   qp.fd = modalFilters.decades.join(',')
    if (modalFilters.languages.length) qp.fl = modalFilters.languages.join(',')
    if (modalFilters.runtime.length)   qp.fr = modalFilters.runtime.join(',')
    api.get(`/api/users/${username}/films`, { params: qp })
      .then(res => {
        setFilms(res.data.data.films ?? [])
        setTotal(res.data.data.total ?? 0)
        setTotalPages(res.data.data.totalPages ?? 1)
      })
      .catch(() => setFilms([]))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, searchParams])

  useEffect(() => { fetchFilms() }, [fetchFilms])

  useHydrateFilmStatuses(films.map(f => f.id))

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Newest first'

  return (
    <div className="px-6 md:px-12 xl:px-60 py-8 space-y-6">

      {/* Toolbar: sort + filter */}
      <div className="flex items-center justify-between gap-3">

        {/* Count */}
        {!loading && (
          <p className="font-roboto text-sm text-text-muted">
            {total.toLocaleString()} {t.profile.filmsCount}
          </p>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-text/15 px-3 py-1.5 font-roboto text-xs font-medium text-text-muted transition-colors hover:border-text/30 hover:text-text"
            >
              <ArrowUpDown size={12} />
              {currentSortLabel}
              <ChevronDown size={11} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-text/10 bg-bg-dark shadow-xl">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { updateParams({ sort: opt.value, page: null }); setSortOpen(false) }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 font-roboto text-xs transition-colors hover:bg-surface ${
                        sort === opt.value ? 'text-purple-light' : 'text-text'
                      }`}
                    >
                      {opt.label}
                      {sort === opt.value && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="relative flex items-center gap-1.5 rounded-lg bg-purple px-4 py-1.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-purple-deep"
          >
            <SlidersHorizontal size={14} />
            {t.profile.filter}
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-purple">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

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
      {totalPages > 1 && (
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
      )}

      {filterOpen && (
        <FilterModal
          filters={modalFilters}
          onApply={(f) => { applyFilters(f); setFilterOpen(false) }}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  )
}
