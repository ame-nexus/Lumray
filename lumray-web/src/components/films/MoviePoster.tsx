'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Eye, Star } from 'lucide-react'
import LogModal from './LogModal'

export interface MoviePosterProps {
  id: number | string      // tmdbId — used for navigation
  dbId?: string            // DB id — needed for diary/rating API calls
  title: string
  year?: string | number
  posterPath: string | null
  rating?: number
  ratingCount?: number
  sizes?: string
  priority?: boolean
}

function buildSrc(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w500${path}`
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function MoviePoster({
  id, dbId, title, year, posterPath, rating, ratingCount, sizes, priority,
}: MoviePosterProps) {
  const src = buildSrc(posterPath)
  const [imgError,     setImgError]     = useState(false)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [watchlisted,  setWatchlisted]  = useState(false)

  const tmdbId = typeof id === 'string' ? parseInt(id) : id

  return (
    <>
      <Link
        href={`/films/${id}`}
        className="group relative block aspect-2/3 overflow-hidden rounded-lg bg-surface"
      >
        {/* Poster image */}
        {src && !imgError ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes={sizes ?? '(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw'}
            className="object-cover"
            priority={priority}
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-2 p-2">
            <span className="text-center font-roboto text-xs text-text-muted line-clamp-3">{title}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/90 via-black/55 to-black/70 p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">

          {/* Top: title + year */}
          <div>
            <p className="font-outfit text-[11px] font-semibold leading-tight text-white line-clamp-2">
              {title}
            </p>
            {year && (
              <p className="mt-0.5 font-roboto text-[10px] text-white/60">{year}</p>
            )}
          </div>

          {/* Middle: Watchlist + Log */}
          <div className="flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setWatchlisted(v => !v)
              }}
              aria-label="Add to watchlist"
              className="flex flex-col items-center gap-1 transition-colors hover:text-white"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                watchlisted ? 'bg-purple text-white' : 'bg-white/15 text-white/80 hover:bg-white/25'
              }`}>
                <Bookmark size={14} className={watchlisted ? 'fill-white' : ''} />
              </div>
              <span className="font-roboto text-[9px] leading-none text-white/80">Watchlist</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setModalOpen(true)
              }}
              aria-label="Log film"
              className="flex flex-col items-center gap-1 text-white/80 transition-colors hover:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-colors hover:bg-white/25">
                <Eye size={14} />
              </div>
              <span className="font-roboto text-[9px] leading-none">Log</span>
            </button>
          </div>

          {/* Bottom: star rating left, count right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={10} className="shrink-0 fill-purple-light text-purple-light" />
              <span className="font-roboto text-[11px] font-semibold text-white">
                {rating != null ? rating.toFixed(1) : '—'}
              </span>
            </div>
            {ratingCount != null && ratingCount > 0 && (
              <span className="font-roboto text-[10px] text-white/50">
                {formatCount(ratingCount)}
              </span>
            )}
          </div>

        </div>
      </Link>

      {modalOpen && (
        <LogModal
          tmdbId={tmdbId}
          dbId={dbId ?? String(id)}
          title={title}
          year={year}
          posterPath={posterPath}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
