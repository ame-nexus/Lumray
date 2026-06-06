'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { tmdbPoster } from '@/lib/tmdbImage'

export interface DiaryEntryData {
  id: string
  watchedAt: string
  isRewatch: boolean
  rating: number | null
  movie: {
    id: string
    title: string
    releaseDate: string | null
    posterPath: string | null
  }
}

function releaseYear(releaseDate: string | null): string | null {
  if (!releaseDate) return null
  const year = releaseDate.slice(0, 4)
  return /^\d{4}$/.test(year) ? year : null
}

function parseDate(iso: string): { day: string; weekday: string } {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '—', weekday: '' }
  return {
    day: String(d.getDate()),
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
  }
}

export default function DiaryEntryRow({ entry }: { entry: DiaryEntryData }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { day, weekday } = parseDate(entry.watchedAt)
  const year = releaseYear(entry.movie.releaseDate)
  const posterSrc = entry.movie.posterPath
    ? tmdbPoster(entry.movie.posterPath, 'w185')
    : null

  return (
    <article className="group flex items-center gap-3 border-b border-text/10 py-3 last:border-0">
      <div className="min-w-[40px] shrink-0 rounded-lg bg-surface-2 px-2 py-1 text-center">
        <p className="font-outfit text-lg font-bold leading-none text-text">{day}</p>
        <p className="hidden font-roboto text-[10px] text-text-muted sm:block">{weekday}</p>
      </div>

      <Link href={`/films/${entry.movie.id}`} className="shrink-0">
        <div className="relative h-20 w-14 overflow-hidden rounded-md bg-surface-2">
          {posterSrc ? (
            <Image src={posterSrc} alt={entry.movie.title} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="flex h-full items-center justify-center p-1">
              <Star size={12} className="text-text-muted" />
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="font-outfit text-sm font-semibold text-text">{entry.movie.title}</h3>
          {year && <span className="font-roboto text-xs text-text-muted">{year}</span>}
        </div>
        {entry.rating != null && (
          <div className="mt-1">
            <StarRating value={entry.rating} size={16} />
          </div>
        )}
        {entry.isRewatch && (
          <p className="mt-1 font-roboto text-xs text-purple-light">○ Rewatch</p>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
        <button
          type="button"
          aria-label="Edit entry"
          className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          aria-label="Delete entry"
          className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="relative md:hidden">
        <button
          type="button"
          aria-label="More actions"
          onClick={() => setMenuOpen((o) => !o)}
          className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] rounded-lg border border-text/10 bg-surface py-1 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 font-roboto text-xs text-text hover:bg-surface-2"
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 font-roboto text-xs text-text hover:bg-surface-2"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
