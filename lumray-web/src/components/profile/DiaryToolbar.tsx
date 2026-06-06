'use client'

import { LayoutGrid, List, Search } from 'lucide-react'

export interface DiaryToolbarProps {
  search: string
  onSearchChange: (v: string) => void
  view: 'list' | 'grid'
  onViewChange: (v: 'list' | 'grid') => void
  onFilterOpen: () => void
}

export default function DiaryToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  onFilterOpen,
}: DiaryToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-md">
        <div className="relative flex-1">
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
        <button
          type="button"
          onClick={onFilterOpen}
          className="shrink-0 rounded-lg bg-purple px-3 py-1.5 font-roboto text-sm text-white transition-colors hover:bg-purple/90"
        >
          Filter
        </button>
      </div>

      <div className="flex items-center gap-1 self-end lg:self-auto">
        <button
          type="button"
          onClick={() => onViewChange('list')}
          aria-label="List view"
          className={[
            'rounded-lg p-2 transition-colors',
            view === 'list' ? 'text-purple-light' : 'text-text-muted hover:text-text',
          ].join(' ')}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => onViewChange('grid')}
          aria-label="Grid view"
          className={[
            'rounded-lg p-2 transition-colors',
            view === 'grid' ? 'text-purple-light' : 'text-text-muted hover:text-text',
          ].join(' ')}
        >
          <LayoutGrid size={18} />
        </button>
      </div>
    </div>
  )
}
