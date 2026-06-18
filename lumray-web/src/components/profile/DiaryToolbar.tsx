'use client'

import { useState } from 'react'
import { LayoutGrid, List, Search, ArrowUpDown, ChevronDown, Check, RefreshCw } from 'lucide-react'

export type DiarySortKey = 'date-desc' | 'date-asc' | 'rating-high' | 'rating-low' | 'title-az'

export interface DiaryToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  view: 'list' | 'grid'
  onViewChange: (v: 'list' | 'grid') => void
  sort: DiarySortKey
  onSortChange: (v: DiarySortKey) => void
  rewatchOnly: boolean
  onRewatchOnlyChange: (v: boolean) => void
}

const SORT_OPTIONS: { label: string; value: DiarySortKey }[] = [
  { label: 'Newest first',    value: 'date-desc'   },
  { label: 'Oldest first',    value: 'date-asc'    },
  { label: 'Rating (high)',   value: 'rating-high' },
  { label: 'Rating (low)',    value: 'rating-low'  },
  { label: 'Title A–Z',       value: 'title-az'    },
]

export default function DiaryToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  sort,
  onSortChange,
  rewatchOnly,
  onRewatchOnlyChange,
}: DiaryToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false)

  const currentLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Newest first'

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

      {/* Left: search */}
      <div className="relative flex-1 lg:max-w-64">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your diary"
          className="w-full rounded-lg border border-text/10 bg-surface-2 py-1.5 pl-9 pr-3 font-roboto text-sm text-text placeholder:text-text-muted focus:border-purple focus:outline-none"
        />
      </div>

      {/* Right: sort + rewatches + view toggle */}
      <div className="flex items-center gap-2 self-end lg:self-auto">

        {/* Rewatches toggle */}
        <button
          type="button"
          onClick={() => onRewatchOnlyChange(!rewatchOnly)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-roboto text-xs font-medium transition-colors ${
            rewatchOnly
              ? 'border-purple bg-purple text-white'
              : 'border-text/15 text-text-muted hover:border-text/30 hover:text-text'
          }`}
        >
          <RefreshCw size={12} />
          Rewatches
        </button>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-1.5 rounded-lg border border-text/15 px-3 py-1.5 font-roboto text-xs font-medium text-text-muted transition-colors hover:border-text/30 hover:text-text"
          >
            <ArrowUpDown size={12} />
            {currentLabel}
            <ChevronDown size={11} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>

          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-text/10 bg-bg-dark shadow-xl">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onSortChange(opt.value); setSortOpen(false) }}
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

        {/* View toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onViewChange('list')}
            aria-label="List view"
            className={`rounded-lg p-2 transition-colors ${view === 'list' ? 'text-purple-light' : 'text-text-muted hover:text-text'}`}
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            aria-label="Grid view"
            className={`rounded-lg p-2 transition-colors ${view === 'grid' ? 'text-purple-light' : 'text-text-muted hover:text-text'}`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>

      </div>
    </div>
  )
}
