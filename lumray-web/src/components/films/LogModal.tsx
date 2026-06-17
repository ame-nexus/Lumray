'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Eye, Heart, Bookmark, Star, StarHalf, PenLine, Loader2, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useFilmStatusStore } from '@/store/filmStatus.store'
import { useRouter } from 'next/navigation'
import api from '@/services/api'

export interface LogModalProps {
  tmdbId: number
  dbId: string
  title: string
  year?: string | number
  posterPath: string | null
  onClose: () => void
}

function nextRating(current: number, star: number): number {
  if (current === star)        return star - 0.5
  if (current === star - 0.5)  return star - 1
  return star
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }, (_, i) => {
        const star   = i + 1
        const isFull = value >= star
        const isHalf = !isFull && value >= star - 0.5
        return (
          <button key={star} type="button" onClick={() => onChange(nextRating(value, star))}>
            {isFull ? (
              <Star size={24} className="fill-purple-light text-purple-light" />
            ) : isHalf ? (
              <StarHalf size={24} className="fill-purple-light text-purple-light" />
            ) : (
              <Star size={24} className="text-text-muted" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function LogModal({ tmdbId: _tmdbId, dbId, title, year, posterPath, onClose }: LogModalProps) {
  const user        = useAuthStore(s => s.user)
  const router      = useRouter()
  const storeStatus = useFilmStatusStore(s => s.statuses[dbId])
  const setStatus   = useFilmStatusStore(s => s.set)

  // Pre-fill from global store (populated if user already opened the film detail page)
  const [watched,     setWatched]     = useState(storeStatus?.watched    ?? false)
  const [favourite,   setFavourite]   = useState(storeStatus?.favourite  ?? false)
  const [watchlisted, setWatchlisted] = useState(storeStatus?.watchlisted ?? false)
  const [rating,      setRating]      = useState(storeStatus?.rating     ?? 0)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [mounted,     setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function requireAuth(): boolean {
    if (!user) { router.push('/login'); return true }
    return false
  }

  async function toggleWatched() {
    if (requireAuth()) return
    const next = !watched
    setWatched(next)
    setStatus(dbId, { watched: next, ...(next ? {} : { rating: 0 }) })
    if (!next && rating > 0) {
      setRating(0)
      api.delete(`/api/ratings/${dbId}`).catch(() => {})
    }
    api.post(`/api/film-status/${dbId}/watched`)
      .then(res => {
        const v = res.data.data.watched ?? next
        setWatched(v)
        setStatus(dbId, { watched: v })
      })
      .catch(() => { setWatched(!next); setStatus(dbId, { watched: !next }) })
  }

  async function toggleFavourite() {
    if (requireAuth()) return
    const next = !favourite
    setFavourite(next)
    setStatus(dbId, { favourite: next })
    api.post(`/api/film-status/${dbId}/favourite`)
      .then(res => {
        const v = res.data.data.favourite ?? next
        setFavourite(v)
        setStatus(dbId, { favourite: v })
      })
      .catch(() => { setFavourite(!next); setStatus(dbId, { favourite: !next }) })
  }

  async function toggleWatchlist() {
    if (requireAuth()) return
    const next = !watchlisted
    setWatchlisted(next)
    setStatus(dbId, { watchlisted: next })
    api.post(`/api/film-status/${dbId}/watchlist`)
      .then(res => {
        const v = res.data.data.watchlisted ?? next
        setWatchlisted(v)
        setStatus(dbId, { watchlisted: v })
      })
      .catch(() => { setWatchlisted(!next); setStatus(dbId, { watchlisted: !next }) })
  }

  async function handleRatingChange(newRating: number) {
    setRating(newRating)
    setStatus(dbId, { rating: newRating })
    if (newRating > 0) {
      api.post('/api/ratings', { movieId: dbId, score: newRating }).catch(() => {})
      if (!watched) {
        setWatched(true)
        setStatus(dbId, { watched: true })
        api.post(`/api/film-status/${dbId}/watched`).catch(() => {})
      }
    } else {
      api.delete(`/api/ratings/${dbId}`).catch(() => {})
    }
  }

  async function handleLog() {
    if (requireAuth()) return
    if (saving || saved) return
    setSaving(true)
    try {
      await api.post('/api/diary', { movieId: dbId, rating: rating || null, isRewatch: false })
      // The diary endpoint marks the film watched server-side (idempotent) — no extra call,
      // so logging creates exactly one diary entry.
      setWatched(true)
      setStatus(dbId, { watched: true, ...(rating > 0 ? { rating } : {}) })
      setSaved(true)
      setTimeout(onClose, 700)
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false)
    }
  }

  const src = posterPath
    ? posterPath.startsWith('http') ? posterPath : `https://image.tmdb.org/t/p/w300${posterPath}`
    : null

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-surface-2 shadow-2xl">

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-text-muted transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4 p-5 pb-4">
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
            {src && (
              <Image src={src} alt={title} fill className="object-cover" sizes="64px" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-outfit text-base font-bold leading-tight text-white">{title}</h2>
            {year && (
              <span className="mt-1 font-roboto text-sm text-text-muted">{year}</span>
            )}
          </div>
        </div>

        <div className="px-5 pb-5 space-y-5">

          <div className="flex items-center justify-around">
            {[
              { label: 'Watched',   icon: Eye,      active: watched,     onClick: toggleWatched   },
              { label: 'Favourite', icon: Heart,    active: favourite,   onClick: toggleFavourite },
              { label: 'Watchlist', icon: Bookmark, active: watchlisted, onClick: toggleWatchlist },
            ].map(({ label, icon: Icon, active, onClick }) => (
              <button key={label} type="button" onClick={onClick} className="flex flex-col items-center gap-2">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  active ? 'bg-purple text-white' : 'bg-surface text-text hover:bg-surface-2'
                }`}>
                  <Icon size={20} />
                </span>
                <span className="font-roboto text-[11px] text-text-muted">{label}</span>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 font-roboto text-xs text-text-muted">
              {rating > 0 ? `Rated ${rating} / 5` : 'Rate this film'}
            </p>
            <StarPicker value={rating} onChange={handleRatingChange} />
          </div>

          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handleLog}
              disabled={saving || saved}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple py-2.5 font-roboto text-sm font-semibold text-white transition-colors hover:bg-purple-deep disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <PenLine size={15} />}
              {saving ? 'Logging…' : saved ? 'Logged!' : 'Log'}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}
