'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Bookmark, Eye, Heart, Star, StarHalf,
  PenLine, ListPlus, ImagePlus, Share2,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import api from '@/services/api'
import ReviewModal from './ReviewModal'
import AddToListsModal from './AddToListsModal'

export interface MovieActionsProps {
  movieId: string
  movieTitle?: string
  // extra props used only by the mobileInline variant
  posterPath?: string | null
  releaseDate?: string | null
  director?: string | null
  mobileInline?: boolean
}

const ACTION_LINKS = [
  { label: 'Review or Log',          icon: PenLine,   key: 'review'  },
  { label: 'Add to lists',           icon: ListPlus,  key: 'lists'   },
  { label: 'Change Poster/Backdrop', icon: ImagePlus, key: 'poster'  },
  { label: 'Share',                  icon: Share2,    key: 'share'   },
] as const

function nextRating(current: number, star: number): number {
  if (current === star)        return star - 0.5
  if (current === star - 0.5)  return star - 1
  return star
}

function StarPicker({ value, onPick, size = 28 }: { value: number; onPick: (n: number) => void; size?: number }) {
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        const isFull = value >= star
        const isHalf = !isFull && value >= star - 0.5
        return (
          <button key={star} type="button" onClick={() => onPick(nextRating(value, star))} className="flex items-center justify-center">
            {isFull ? (
              <Star size={size} className="fill-purple-light text-purple-light" />
            ) : isHalf ? (
              <span className="relative block" style={{ width: size, height: size }}>
                <Star size={size} className="text-text-muted" />
                <span className="absolute inset-0 overflow-hidden" style={{ width: size / 2 }}>
                  <Star size={size} className="fill-purple-light text-purple-light" />
                </span>
              </span>
            ) : (
              <Star size={size} className="text-text-muted" />
            )}
          </button>
        )
      })}
    </div>
  )
}

interface ToggleRowProps {
  compact?: boolean
  watched: boolean; favourite: boolean; watchlisted: boolean
  onToggleWatched: () => void; onToggleFavourite: () => void; onToggleWatchlist: () => void
}

function ToggleRow({ compact, watched, favourite, watchlisted, onToggleWatched, onToggleFavourite, onToggleWatchlist }: ToggleRowProps) {
  const buttons = [
    { key: 'watched',   label: 'Watched',   icon: Eye,      active: watched,     onClick: onToggleWatched   },
    { key: 'favourite', label: 'Favourite', icon: Heart,    active: favourite,   onClick: onToggleFavourite },
    { key: 'watchlist', label: 'Watchlist', icon: Bookmark, active: watchlisted, onClick: onToggleWatchlist },
  ] as const

  return (
    <div className={`flex items-center ${compact ? 'justify-start gap-3' : 'justify-between'}`}>
      {buttons.map(({ key, label, icon: Icon, active, onClick }) => (
        <button key={key} type="button" onClick={onClick} className="flex flex-col items-center gap-1.5">
          <span className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
            active ? 'border border-purple bg-purple/20 text-purple' : 'bg-surface-2 text-text'
          }`}>
            <Icon size={24} className={active ? 'text-purple' : ''} />
          </span>
          {!compact && <span className="font-roboto text-[10px] text-text-muted">{label}</span>}
        </button>
      ))}
    </div>
  )
}

export default function MovieActions({
  movieId, movieTitle = '',
  posterPath, releaseDate, director,
  mobileInline = false,
}: MovieActionsProps) {
  const router = useRouter()
  const user   = useAuthStore(s => s.user)

  const [watched,      setWatched]      = useState(false)
  const [favourite,    setFavourite]    = useState(false)
  const [watchlisted,  setWatchlisted]  = useState(false)
  const [rating,       setRating]       = useState(0)
  const [reviewOpen,   setReviewOpen]   = useState(false)
  const [listsOpen,    setListsOpen]    = useState(false)
  const [mounted,      setMounted]      = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!user || !movieId) return
    api.get(`/api/film-status/${movieId}`)
      .then(res => {
        const d = res.data.data
        setWatched(d.watched)
        setFavourite(d.favourite)
        setWatchlisted(d.watchlisted)
        setRating(d.rating ?? 0)
      })
      .catch(() => {})
  }, [user, movieId])

  function requireAuth(): boolean {
    if (user) return false
    router.push('/login')
    return true
  }

  async function handleWatched() {
    if (requireAuth()) return
    const next = !watched
    setWatched(next)
    if (next) await api.post(`/api/film-status/${movieId}/watched`).catch(() => setWatched(!next))
  }

  async function handleFavourite() {
    if (requireAuth()) return
    setFavourite(v => !v)
    api.post(`/api/film-status/${movieId}/favourite`)
      .then(res => setFavourite(res.data.data.favourite))
      .catch(() => setFavourite(v => !v))
  }

  async function handleWatchlist() {
    if (requireAuth()) return
    setWatchlisted(v => !v)
    api.post(`/api/film-status/${movieId}/watchlist`)
      .then(res => setWatchlisted(res.data.data.watchlisted))
      .catch(() => setWatchlisted(v => !v))
  }

  async function handleRating(newRating: number) {
    if (requireAuth()) return
    setRating(newRating)
    if (newRating === 0) {
      await api.delete(`/api/ratings/${movieId}`).catch(() => {})
    } else {
      await api.post('/api/ratings', { movieId, score: newRating }).catch(() => {})
      if (!watched) {
        setWatched(true)
        await api.post(`/api/film-status/${movieId}/watched`).catch(() => {})
      }
    }
  }

  function handleAction(key: string) {
    if (requireAuth()) return
    if (key === 'review') setReviewOpen(true)
    if (key === 'lists')  setListsOpen(true)
  }

  const toggleProps: ToggleRowProps = {
    watched, favourite, watchlisted,
    onToggleWatched:   handleWatched,
    onToggleFavourite: handleFavourite,
    onToggleWatchlist: handleWatchlist,
  }

  const posterSrc = posterPath
    ? posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w200${posterPath}`
    : null

  const modals = (
    <>
      {reviewOpen && (
        <ReviewModal
          movieId={movieId}
          movieTitle={movieTitle}
          initialRating={rating}
          onClose={() => setReviewOpen(false)}
          onSaved={() => {}}
        />
      )}
      {listsOpen && (
        <AddToListsModal
          movieId={movieId}
          onClose={() => setListsOpen(false)}
        />
      )}
    </>
  )

  // ── Inline card (mobile/tablet, placed after description) ──────────────
  if (mobileInline) {
    return (
      <>
        <div className="rounded-xl bg-surface p-5 space-y-5">

          {/* Poster + info header */}
          <div className="flex gap-4">
            <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {posterSrc && (
                <Image src={posterSrc} alt={movieTitle} fill className="object-cover" sizes="96px" />
              )}
            </div>
            <div className="flex flex-col justify-center gap-0.5">
              <p className="font-outfit text-base font-bold leading-tight text-white">{movieTitle}</p>
              {releaseDate && (
                <p className="font-roboto text-sm text-text-muted">{releaseDate.slice(0, 4)}</p>
              )}
              {director && (
                <p className="font-roboto text-xs text-text-muted">
                  Directed by <span className="text-purple-light">{director}</span>
                </p>
              )}
            </div>
          </div>

          {/* Watched / Favourite / Watchlist */}
          <ToggleRow {...toggleProps} />

          {/* Star rating */}
          <div>
            <p className="mb-2 font-roboto text-xs text-text-muted">
              {rating > 0 ? `Rated ${rating} / 5` : 'Rate this film'}
            </p>
            <StarPicker value={rating} onPick={handleRating} size={26} />
          </div>

          <div className="border-t border-text/10" />

          {/* Action links */}
          <div className="divide-y divide-text/10">
            {ACTION_LINKS.map(({ label, icon: Icon, key }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleAction(key)}
                className="flex w-full items-center gap-3 py-2.5 font-roboto text-sm text-text transition-colors hover:text-purple-light"
              >
                <Icon size={15} className="shrink-0 opacity-70" />
                {label}
              </button>
            ))}
          </div>
        </div>
        {modals}
      </>
    )
  }

  // ── Desktop sidebar card + mobile strip + bottom sheet ─────────────────
  const desktopCard = (
    <div className="hidden rounded-xl bg-surface p-5 lg:block">
      <ToggleRow {...toggleProps} />
      <div className="my-5">
        <StarPicker value={rating} onPick={handleRating} />
      </div>
      <div className="divide-y divide-text/10">
        {ACTION_LINKS.map(({ label, icon: Icon, key }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleAction(key)}
            className="flex w-full items-center justify-center gap-2 py-2.5 font-roboto text-sm text-text transition-colors hover:text-purple-light"
          >
            <Icon size={15} className="shrink-0 opacity-70" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {desktopCard}
      {modals}
    </>
  )
}

export const DUMMY_MOVIE_ACTIONS: MovieActionsProps = { movieId: '965150' }
