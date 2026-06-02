'use client'

import { useState, useEffect } from 'react'
import { SlidersHorizontal, LayoutGrid, Grid3X3, ChevronDown, ArrowUpDown, Check } from 'lucide-react'
import api from '@/services/api'
import FilterModal, { ModalFilters, DEFAULT_MODAL_FILTERS } from '@/components/films/FilterModal'
import MoviePoster from '@/components/films/MoviePoster'

type Tab = 'popular' | 'top-rated' | 'new-releases' | 'by-genre' | 'by-year' | 'by-decade'
type Layout = 'comfortable' | 'compact'

interface BrowseMovie {
  id: string
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string | null
  voteAverage: number
  voteCount: number
  popularity: number
  genres: { genre: { name: string } }[]
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'popular',      label: 'Popular' },
  { id: 'top-rated',    label: 'Top rated' },
  { id: 'new-releases', label: 'New releases' },
  { id: 'by-genre',     label: 'By genre' },
  { id: 'by-year',      label: 'By year' },
  { id: 'by-decade',    label: 'By decade' },
]

const SORT_OPTIONS = [
  { label: 'Popular',      value: 'popular' },
  { label: 'Top rated',    value: 'top-rated' },
  { label: 'New releases', value: 'new-releases' },
  { label: 'A–Z',          value: 'a-z' },
]

const GENRES  = ['All genres', 'Drama', 'Action', 'Thriller', 'Animation', 'Romance', 'Comedy', 'Science Fiction', 'Horror', 'Crime', 'Documentary', 'Fantasy', 'Mystery', 'Adventure']
const YEARS   = Array.from({ length: 56 }, (_, i) => String(2025 - i))
const DECADES = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s', '1950s']

function getPills(tab: Tab): string[] | null {
  if (tab === 'by-genre')  return GENRES
  if (tab === 'by-year')   return YEARS
  if (tab === 'by-decade') return DECADES
  return null
}

function CountBar({ total }: { total: number }) {
  return (
    <div className="mb-6 rounded-lg bg-surface px-4 py-2.5 text-center">
      <span className="font-roboto text-sm font-semibold text-white">
        {total.toLocaleString()} films found
      </span>
    </div>
  )
}

function LoadingSkeleton({ layout }: { layout: Layout }) {
  const count = layout === 'comfortable' ? 24 : 60
  return (
    <div className={`grid gap-2 md:gap-3 ${
      layout === 'comfortable'
        ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
        : 'grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
    }`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-surface" />
      ))}
    </div>
  )
}

export default function FilmsPage() {
  const [tab,           setTab]           = useState<Tab>('popular')
  const [activePills,   setActivePills]   = useState<string[]>([])
  const [pillsExpanded, setPillsExpanded] = useState(false)
  const [sort,          setSort]          = useState('popular')
  const [sortOpen,      setSortOpen]      = useState(false)
  const [modalFilters,  setModalFilters]  = useState<ModalFilters>(DEFAULT_MODAL_FILTERS)
  const [layout,        setLayout]        = useState<Layout>('comfortable')
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [page,          setPage]          = useState(1)

  const [movies,     setMovies]     = useState<BrowseMovie[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)

  const pills      = getPills(tab)
  const isGenreTab = tab === 'by-genre'

  const activeFilterCount =
    modalFilters.genres.length + modalFilters.decades.length +
    modalFilters.languages.length

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
    setActivePills([])
    setPillsExpanded(false)
    setPage(1)
  }

  function handlePillClick(pill: string) {
    if (isGenreTab && pill === 'All genres') {
      setActivePills([])
      setPage(1)
      return
    }
    setActivePills(prev =>
      prev.includes(pill) ? prev.filter(p => p !== pill) : [...prev, pill]
    )
    setPage(1)
  }

  function isPillActive(pill: string): boolean {
    if (isGenreTab && pill === 'All genres') return activePills.length === 0
    return activePills.includes(pill)
  }

  useEffect(() => {
    const effectiveSort =
      tab === 'popular'      ? 'popular'      :
      tab === 'top-rated'    ? 'top-rated'    :
      tab === 'new-releases' ? 'new-releases' :
      sort

    const allGenres  = [...(tab === 'by-genre'  ? activePills : []), ...modalFilters.genres]
    const allDecades = [...(tab === 'by-decade' ? activePills : []), ...modalFilters.decades]
    const allYears   = tab === 'by-year' ? activePills : []

    const limit = layout === 'comfortable' ? 24 : 60

    const params: Record<string, string> = {
      sort:  effectiveSort,
      page:  String(page),
      limit: String(limit),
    }
    if (allGenres.length)              params.genres    = allGenres.join(',')
    if (allDecades.length)             params.decades   = allDecades.join(',')
    if (allYears.length)               params.years     = allYears.join(',')
    if (modalFilters.languages.length) params.languages = modalFilters.languages.join(',')

    setLoading(true)
    api.get('/api/movies/browse', { params })
      .then(res => {
        setMovies(res.data.data.movies)
        setTotal(res.data.data.total)
        setTotalPages(res.data.data.totalPages)
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false))
  }, [tab, activePills, sort, modalFilters, page, layout])

  return (
    <main className="px-6 md:px-12 xl:px-60 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-outfit text-3xl md:text-4xl font-bold text-white">Films</h1>
        <p className="mt-1 font-roboto text-text-muted">Browse, filter and discover films from across the world</p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 border-b border-text/10">
        <div
          className="flex items-center gap-6 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {TABS.map(t => (
            <button key={t.id} onClick={() => handleTabChange(t.id)}
              className={`-mb-px whitespace-nowrap border-b-2 pb-3 font-roboto text-sm font-medium transition-colors md:text-base ${
                tab === t.id
                  ? 'border-purple-light text-purple-light'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pills + Filter row */}
      <div className="mb-6 flex items-start gap-3">
        {pills && (
          <div className="min-w-0 flex-1">
            <div className={`flex gap-2 ${pillsExpanded ? 'flex-wrap' : 'flex-nowrap overflow-hidden'}`}>
              {pills.map(pill => (
                <button key={pill} onClick={() => handlePillClick(pill)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 font-roboto text-sm font-medium transition-colors ${
                    isPillActive(pill)
                      ? 'border-purple-light bg-purple-light text-bg'
                      : 'border-text/20 bg-transparent text-text hover:border-text/40'
                  }`}>
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`flex shrink-0 items-center gap-2 ${!pills ? 'ml-auto' : ''}`}>
          {pills && (
            <button onClick={() => setPillsExpanded(v => !v)}
              aria-label={pillsExpanded ? 'Collapse' : 'Expand'}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-text/20 text-text transition-colors hover:border-text/40">
              <ChevronDown size={16} className={`transition-transform duration-200 ${pillsExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Sort dropdown — only on filter tabs, not on sort-based tabs */}
          {(tab === 'by-genre' || tab === 'by-year' || tab === 'by-decade') && <div className="relative">
            <button onClick={() => setSortOpen(v => !v)}
              className="flex items-center gap-2 rounded-full border border-text/20 px-4 py-1.5 font-roboto text-sm font-medium text-text transition-colors hover:border-text/40">
              <ArrowUpDown size={14} />
              Sort
              <ChevronDown size={12} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-text/10 bg-bg-dark shadow-xl">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setSort(opt.value); setSortOpen(false); setPage(1) }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 font-roboto text-sm transition-colors hover:bg-surface ${
                        sort === opt.value ? 'text-purple-light' : 'text-text'
                      }`}>
                      {opt.label}
                      {sort === opt.value && <Check size={13} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          }

          {/* Filter button */}
          <button onClick={() => setFilterOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-purple px-4 py-1.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-purple-deep">
            <SlidersHorizontal size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-purple">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center overflow-hidden rounded-lg border border-text/20">
            <button onClick={() => setLayout('comfortable')}
              className={`p-2 transition-colors ${layout === 'comfortable' ? 'bg-surface text-white' : 'text-text-muted hover:text-text'}`}
              aria-label="Comfortable grid">
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setLayout('compact')}
              className={`p-2 transition-colors ${layout === 'compact' ? 'bg-surface text-white' : 'text-text-muted hover:text-text'}`}
              aria-label="Compact grid">
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton layout={layout} />
      ) : (
        <div className={`grid gap-2 md:gap-3 ${
          layout === 'comfortable'
            ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
            : 'grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'
        }`}>
          {movies.map(movie => (
            <MoviePoster
              key={movie.id}
              id={movie.tmdbId}
              title={movie.title}
              posterPath={movie.posterPath}
              year={movie.releaseDate?.slice(0, 4)}
              rating={movie.voteAverage / 2}
              ratingCount={movie.voteCount}
            />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          className="rounded-full border border-text/20 px-6 py-2 font-roboto text-sm font-medium text-text transition-colors disabled:opacity-30 hover:border-text/40">
          Prev
        </button>
        <span className="font-roboto text-sm text-text-muted">Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
          className="rounded-full bg-purple px-6 py-2 font-roboto text-sm font-medium text-white transition-colors hover:bg-purple-deep disabled:opacity-30">
          Next
        </button>
      </div>

      {filterOpen && (
        <FilterModal
          filters={modalFilters}
          onApply={(f) => { setModalFilters(f); setPage(1) }}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </main>
  )
}
