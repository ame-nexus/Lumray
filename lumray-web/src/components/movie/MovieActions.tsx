'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Bookmark, Eye, Heart, Star,
  PenLine, ListPlus, ImagePlus, Share2,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useFilmStatusStore } from '@/store/filmStatus.store'
import api from '@/services/api'
import ReviewModal from './ReviewModal'
import AddToListsModal from './AddToListsModal'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface MovieActionsProps {
  movieId: string
  movieTitle?: string
  posterPath?: string | null
  releaseDate?: string | null
  director?: string | null
  mobileInline?: boolean
}

function nextRating(current: number, star: number): number {
  if (current === star)       return star - 0.5
  if (current === star - 0.5) return star - 1
  return star
}

function StarPicker({ value, onPick, size = 28 }: { value: number; onPick: (n: number) => void; size?: number }) {
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star   = i + 1
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
  compact?:          boolean
  watched:           boolean
  favourite:         boolean
  watchlisted:       boolean
  onToggleWatched:   () => void
  onToggleFavourite: () => void
  onToggleWatchlist: () => void
  labels: { watched: string; favourite: string; watchlist: string }
}

function ToggleRow({ compact, watched, favourite, watchlisted, onToggleWatched, onToggleFavourite, onToggleWatchlist, labels }: ToggleRowProps) {
  const buttons = [
    { key: 'watched',   label: labels.watched,   icon: Eye,      active: watched,     onClick: onToggleWatched   },
    { key: 'favourite', label: labels.favourite, icon: Heart,    active: favourite,   onClick: onToggleFavourite },
    { key: 'watchlist', label: labels.watchlist, icon: Bookmark, active: watchlisted, onClick: onToggleWatchlist },
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
  const lang   = useLanguageStore(s => s.lang)
  const t      = useT(lang)

  // ── Global film-status store ──────────────────────────────────────────────
  const loadStatus  = useFilmStatusStore(s => s.load)
  const setStatus   = useFilmStatusStore(s => s.set)
  const status      = useFilmStatusStore(s => s.statuses[movieId])

  const watched    = status?.watched    ?? false
  const favourite  = status?.favourite  ?? false
  const watchlisted = status?.watchlisted ?? false
  const rating     = status?.rating     ?? 0

  const [reviewOpen, setReviewOpen] = useState(false)
  const [listsOpen,  setListsOpen]  = useState(false)

  // Load status from API on mount (no-op if already cached in store)
  useEffect(() => {
    if (user && movieId) loadStatus(movieId)
  }, [user, movieId, loadStatus])

  function requireAuth(): boolean {
    if (user) return false
    router.push('/login')
    return true
  }

  async function handleWatched() {
    if (requireAuth()) return
    const next = !watched
    setStatus(movieId, { watched: next, ...(next ? {} : { rating: 0 }) })
    if (!next && rating > 0) {
      await api.delete(`/api/ratings/${movieId}`).catch(() => {})
    }
    await api.post(`/api/film-status/${movieId}/watched`)
      .then(res => setStatus(movieId, { watched: res.data.data.watched ?? next }))
      .catch(() => setStatus(movieId, { watched: !next, ...(next ? {} : { rating }) }))
  }

  async function handleFavourite() {
    if (requireAuth()) return
    const next = !favourite
    setStatus(movieId, { favourite: next })
    api.post(`/api/film-status/${movieId}/favourite`)
      .then(res => setStatus(movieId, { favourite: res.data.data.favourite ?? next }))
      .catch(() => setStatus(movieId, { favourite: !next }))
  }

  async function handleWatchlist() {
    if (requireAuth()) return
    const next = !watchlisted
    setStatus(movieId, { watchlisted: next })
    api.post(`/api/film-status/${movieId}/watchlist`)
      .then(res => setStatus(movieId, { watchlisted: res.data.data.watchlisted ?? next }))
      .catch(() => setStatus(movieId, { watchlisted: !next }))
  }

  async function handleRating(newRating: number) {
    if (requireAuth()) return
    setStatus(movieId, { rating: newRating })
    if (newRating === 0) {
      await api.delete(`/api/ratings/${movieId}`).catch(() => {})
    } else {
      await api.post('/api/ratings', { movieId, score: newRating }).catch(() => {})
      if (!watched) {
        setStatus(movieId, { watched: true })
        await api.post(`/api/film-status/${movieId}/watched`).catch(() => {})
      }
    }
  }

  function handleAction(key: string) {
    if (requireAuth()) return
    if (key === 'review') setReviewOpen(true)
    if (key === 'lists')  setListsOpen(true)
  }

  const actionLinks = [
    { label: t.movie.reviewLog,    icon: PenLine,   key: 'review' as const },
    { label: t.movie.addToLists,   icon: ListPlus,  key: 'lists'  as const },
    { label: t.movie.changePoster, icon: ImagePlus, key: 'poster' as const },
    { label: t.movie.share,        icon: Share2,    key: 'share'  as const },
  ]

  const toggleProps: ToggleRowProps = {
    watched, favourite, watchlisted,
    onToggleWatched:   handleWatched,
    onToggleFavourite: handleFavourite,
    onToggleWatchlist: handleWatchlist,
    labels: { watched: t.movie.watched, favourite: t.movie.favourite, watchlist: t.movie.watchlist },
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
                  {t.movie.directedBy} <span className="text-purple-light">{director}</span>
                </p>
              )}
            </div>
          </div>

          <ToggleRow {...toggleProps} />

          <div>
            <p className="mb-2 font-roboto text-xs text-text-muted">
              {rating > 0 ? `${t.movie.rated} ${rating} ${t.movie.outOf5}` : t.movie.rateThisFilm}
            </p>
            <StarPicker value={rating} onPick={handleRating} size={26} />
          </div>

          <div className="border-t border-text/10" />

          <div className="divide-y divide-text/10">
            {actionLinks.map(({ label, icon: Icon, key }) => (
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

  // ── Desktop sidebar card ────────────────────────────────────────────────
  return (
    <>
      <div className="hidden rounded-xl bg-surface p-5 lg:block">
        <ToggleRow {...toggleProps} />
        <div className="my-5">
          <StarPicker value={rating} onPick={handleRating} />
        </div>
        <div className="divide-y divide-text/10">
          {actionLinks.map(({ label, icon: Icon, key }) => (
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
      {modals}
    </>
  )
}

export const DUMMY_MOVIE_ACTIONS: MovieActionsProps = { movieId: '965150' }
