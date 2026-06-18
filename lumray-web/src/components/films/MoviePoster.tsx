'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Eye, Plus, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useFilmStatusStore } from '@/store/filmStatus.store'
import api from '@/services/api'
import LogModal from './LogModal'

export interface MoviePosterProps {
  id: number | string
  dbId?: string
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

function UserStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => {
        const filled = score >= i
        const half   = !filled && score >= i - 0.5
        return (
          <span key={i} className="relative inline-block" style={{ width: 12, height: 12 }}>
            <Star size={12} className="absolute inset-0 text-white/30" />
            {(filled || half) && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: half ? '50%' : '100%' }}>
                <Star size={12} className="fill-purple-light text-purple-light" />
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default function MoviePoster({
  id, dbId, title, year, posterPath, rating, ratingCount, sizes, priority,
}: MoviePosterProps) {
  const src    = buildSrc(posterPath)
  const router = useRouter()
  const user   = useAuthStore(s => s.user)

  const storeStatus    = useFilmStatusStore(s => dbId ? s.statuses[dbId] : undefined)
  const setStoreStatus = useFilmStatusStore(s => s.set)

  const [imgError,  setImgError]  = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const tmdbId      = typeof id === 'string' ? parseInt(id) : id
  const watchlisted = storeStatus?.watchlisted ?? false
  const watched     = storeStatus?.watched     ?? false
  const userRating  = storeStatus?.rating      ?? 0

  async function handleWatchlist(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (!user) { router.push('/login'); return }
    if (!dbId) return
    const next = !watchlisted
    setStoreStatus(dbId, { watchlisted: next })
    api.post(`/api/film-status/${dbId}/watchlist`)
      .then(res => setStoreStatus(dbId, { watchlisted: res.data.data.watchlisted ?? next }))
      .catch(() => setStoreStatus(dbId, { watchlisted: !next }))
  }

  async function handleWatched(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (!user) { router.push('/login'); return }
    if (!dbId) return
    const next = !watched
    setStoreStatus(dbId, { watched: next })
    api.post(`/api/film-status/${dbId}/watched`)
      .then(res => setStoreStatus(dbId, { watched: res.data.data.watched ?? next }))
      .catch(() => setStoreStatus(dbId, { watched: !next }))
  }

  function openLog(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (!user) { router.push('/login'); return }
    setModalOpen(true)
  }

  const showUserRating = user && userRating > 0

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

        {/* Always-visible user rating — fades out when hover overlay appears */}
        {showUserRating && (
          <div className="absolute bottom-0 inset-x-0 flex items-end justify-center pb-2 pt-8 bg-linear-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-200 group-hover:opacity-0">
            <UserStars score={userRating} />
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

          {/* Middle: Watchlist + Watched + Log */}
          <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={handleWatchlist} aria-label="Add to watchlist"
              className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                watchlisted ? 'bg-purple text-white' : 'bg-white/15 text-white/80 hover:bg-white/25'
              }`}>
                <Bookmark size={14} className={watchlisted ? 'fill-white' : ''} />
              </div>
              <span className="font-roboto text-[9px] leading-none text-white/80">Watchlist</span>
            </button>

            <button type="button" onClick={handleWatched}
              aria-label={watched ? 'Mark as not watched' : 'Mark as watched'}
              className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                watched ? 'bg-purple text-white' : 'bg-white/15 text-white/80 hover:bg-white/25'
              }`}>
                <Eye size={14} className={watched ? 'fill-white' : ''} />
              </div>
              <span className="font-roboto text-[9px] leading-none text-white/80">Watched</span>
            </button>

            <button type="button" onClick={openLog} aria-label="Log film"
              className="flex flex-col items-center gap-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/25">
                <Plus size={16} />
              </div>
              <span className="font-roboto text-[9px] leading-none text-white/80">Log</span>
            </button>
          </div>

          {/* Bottom: TMDb rating + count */}
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
