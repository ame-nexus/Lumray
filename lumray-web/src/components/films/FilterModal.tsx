'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface ModalFilters {
  genres: string[]
  decades: string[]
  languages: string[]
  runtime: string[]
}

export const DEFAULT_MODAL_FILTERS: ModalFilters = {
  genres: [],
  decades: [],
  languages: [],
  runtime: [],
}

interface FilterModalProps {
  filters: ModalFilters
  onApply: (filters: ModalFilters) => void
  onClose: () => void
}

const GENRE_OPTIONS = [
  'Drama', 'Action', 'Thriller', 'Comedy', 'Animation', 'Romance',
  'Science Fiction', 'Horror', 'Crime', 'Documentary', 'Fantasy', 'Mystery',
  'Adventure', 'Western',
]

const DECADE_OPTIONS = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s', '1960s', '1950s']

const LANGUAGE_OPTIONS = [
  { label: 'English',    code: 'en' },
  { label: 'French',     code: 'fr' },
  { label: 'Japanese',   code: 'ja' },
  { label: 'Korean',     code: 'ko' },
  { label: 'Spanish',    code: 'es' },
  { label: 'Italian',    code: 'it' },
  { label: 'German',     code: 'de' },
  { label: 'Hindi',      code: 'hi' },
  { label: 'Portuguese', code: 'pt' },
  { label: 'Chinese',    code: 'zh' },
]

const RUNTIME_OPTIONS = ['Under 90 min', '90–120 min', '120–180 min', 'Over 180 min']

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-3 font-roboto text-xs font-semibold uppercase tracking-wider text-text-muted">
      {title}
    </h3>
  )
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value]
}

function GridCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-surface">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-purple-light shrink-0" />
      <span className="font-roboto text-sm text-text truncate">{label}</span>
    </label>
  )
}

export default function FilterModal({ filters, onApply, onClose }: FilterModalProps) {
  const [draft, setDraft] = useState<ModalFilters>({ ...filters })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const activeCount = draft.genres.length + draft.decades.length + draft.languages.length + draft.runtime.length

  if (!mounted) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-9998 bg-black/60" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-9999 flex w-full max-w-sm flex-col bg-bg-dark shadow-2xl">
        <div className="flex items-center justify-between border-b border-text/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="font-outfit text-xl font-bold text-white">Filter</h2>
            {activeCount > 0 && (
              <span className="rounded-full bg-purple px-2 py-0.5 font-roboto text-xs text-white">
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted transition-colors hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">

          <div>
            <SectionHeader title="Genre" />
            <div className="grid grid-cols-2 gap-x-2">
              {GENRE_OPTIONS.map(g => (
                <GridCheckbox key={g} label={g} checked={draft.genres.includes(g)}
                  onChange={() => setDraft(d => ({ ...d, genres: toggle(d.genres, g) }))} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Decade" />
            <div className="grid grid-cols-2 gap-x-2">
              {DECADE_OPTIONS.map(d => (
                <GridCheckbox key={d} label={d} checked={draft.decades.includes(d)}
                  onChange={() => setDraft(p => ({ ...p, decades: toggle(p.decades, d) }))} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Language" />
            <div className="grid grid-cols-2 gap-x-2">
              {LANGUAGE_OPTIONS.map(lang => (
                <GridCheckbox key={lang.code} label={lang.label} checked={draft.languages.includes(lang.code)}
                  onChange={() => setDraft(d => ({ ...d, languages: toggle(d.languages, lang.code) }))} />
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title="Runtime" />
            <div className="grid grid-cols-2 gap-x-2">
              {RUNTIME_OPTIONS.map(r => (
                <GridCheckbox key={r} label={r} checked={draft.runtime.includes(r)}
                  onChange={() => setDraft(d => ({ ...d, runtime: toggle(d.runtime, r) }))} />
              ))}
            </div>
          </div>

        </div>

        <div className="flex items-center gap-3 border-t border-text/10 px-6 py-5">
          <button onClick={() => setDraft(DEFAULT_MODAL_FILTERS)}
            className="flex-1 rounded-full border border-text/20 py-2.5 font-roboto text-sm font-medium text-text transition-colors hover:border-text/40">
            Reset
          </button>
          <button onClick={() => { onApply(draft); onClose() }}
            className="flex-1 rounded-full bg-purple py-2.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-purple-deep">
            Apply
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
