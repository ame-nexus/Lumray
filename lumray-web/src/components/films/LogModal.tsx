'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, Eye, Heart, Bookmark, Star, StarHalf, PenLine, ListPlus } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
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
        const star = i + 1
        const isFull = value >= star
        const isHalf = !isFull && value >= star - 0.5
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(nextRating(value, star))}
          >
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

export default function LogModal({ tmdbId, dbId, title, year, posterPath, onClose }: LogModalProps) {
  const user     = useAuthStore(s => s.user)
  const router   = useRouter()

  const [watched,     setWatched]     = useState(false)
  const [favourite,   setFavourite]   = useState(false)
  const [watchlisted, setWatchlisted] = useState(false)
  const [rating,      setRating]      = useState(0)
  const [saving,      setSaving]      = useState(false)
  const [mounted,     setMounted]     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function requireAuth() {
    if (!user) { router.push('/login'); return true }
    return false
  }

  async function handleWatchlist() {
    if (requireAuth()) return
    setWatchlisted(v => !v)
  }

  async function handleLog() {
    if (requireAuth()) return
    if (saving) return
    setSaving(true)
    try {
      await api.post('/api/diary', { movieId: dbId, rating: rating || null, isRewatch: false })
      if (rating > 0) {
        await api.post('/api/ratings', { movieId: dbId, score: rating })
      }
      setWatched(true)
    } catch {
      // silent fail — user can retry
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
              { label: 'Watched',   icon: Eye,      active: watched,     onClick: () => { if (!requireAuth()) setWatched(v => !v) } },
              { label: 'Favorite',  icon: Heart,    active: favourite,   onClick: () => { if (!requireAuth()) setFavourite(v => !v) } },
              { label: 'WatchList', icon: Bookmark, active: watchlisted, onClick: handleWatchlist },
            ].map(({ label, icon: Icon, active, onClick }) => (
              <button key={label} type="button" onClick={onClick} className="flex flex-col items-center gap-2">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  active ? 'bg-purple text-white' : 'bg-surface-2 text-text hover:bg-surface'
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
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="border-t border-white/10" />

          <div className="space-y-0 divide-y divide-white/10">
            <button
              type="button"
              onClick={handleLog}
              disabled={saving}
              className="flex w-full items-center gap-3 py-2.5 font-roboto text-sm text-text transition-colors hover:text-purple-light disabled:opacity-50"
            >
              <PenLine size={15} className="opacity-60" />
              {saving ? 'Saving…' : 'Review or Log'}
            </button>
            <button
              type="button"
              onClick={() => { if (!requireAuth()) { /* TODO: open lists modal */ } }}
              className="flex w-full items-center gap-3 py-2.5 font-roboto text-sm text-text transition-colors hover:text-purple-light"
            >
              <ListPlus size={15} className="opacity-60" />
              Add to lists
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}
