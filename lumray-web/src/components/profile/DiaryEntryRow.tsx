'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Star, Trash2, X, Loader2 } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { tmdbPoster } from '@/lib/tmdbImage'
import api from '@/services/api'

export interface DiaryEntryData {
  id: string
  watchedAt: string
  isRewatch: boolean
  rating: number | null
  notes?: string | null
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

function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

// ── Edit Modal ─────────────────────────────────────────────────────────────

interface EditModalProps {
  entry: DiaryEntryData
  onClose: () => void
  onSaved: (updated: DiaryEntryData) => void
}

function EditModal({ entry, onClose, onSaved }: EditModalProps) {
  const [watchedAt,  setWatchedAt]  = useState(toDateInput(entry.watchedAt))
  const [rating,     setRating]     = useState<number | null>(entry.rating)
  const [isRewatch,  setIsRewatch]  = useState(entry.isRewatch)
  const [notes,      setNotes]      = useState(entry.notes ?? '')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      await api.put(`/api/diary/${entry.id}`, {
        watchedAt: watchedAt ? new Date(watchedAt).toISOString() : undefined,
        rating,
        notes: notes.trim() || null,
        isRewatch,
      })
      onSaved({
        ...entry,
        watchedAt: watchedAt ? new Date(watchedAt).toISOString() : entry.watchedAt,
        rating,
        notes: notes.trim() || null,
        isRewatch,
      })
      onClose()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface border border-text/10 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-outfit text-base font-semibold text-text">{entry.movie.title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-1.5">
          <label className="font-roboto text-xs text-text-muted">Date watched</label>
          <input
            type="date"
            value={watchedAt}
            onChange={e => setWatchedAt(e.target.value)}
            className="rounded-lg bg-bg px-3 py-2 font-roboto text-sm text-text focus:outline-none focus:ring-1 focus:ring-purple/50"
          />
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-1.5">
          <label className="font-roboto text-xs text-text-muted">Rating</label>
          <div className="flex items-center gap-2">
            <StarRating value={rating ?? 0} size={20} onChange={setRating} />
            {rating != null && (
              <button
                onClick={() => setRating(null)}
                className="font-roboto text-[10px] text-text-muted hover:text-text transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Rewatch */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setIsRewatch(v => !v)}
            className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
              isRewatch ? 'bg-purple border-purple' : 'border-text/30 bg-transparent'
            }`}
          >
            {isRewatch && <span className="text-[10px] text-white font-bold">✓</span>}
          </div>
          <span className="font-roboto text-sm text-text">Rewatch</span>
        </label>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="font-roboto text-xs text-text-muted">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did you think?"
            rows={3}
            className="resize-none rounded-lg bg-bg px-3 py-2 font-roboto text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
          />
        </div>

        {error && <p className="font-roboto text-xs text-red-400">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-text/15 py-2 font-roboto text-sm text-text-muted hover:border-text/30 hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-purple py-2 font-roboto text-sm font-semibold text-white hover:bg-purple-deep disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Confirm Modal ──────────────────────────────────────────────────────────

function ConfirmModal({ title, message, onConfirm, onCancel, loading }: {
  title: string
  message: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-xs rounded-2xl bg-surface border border-text/10 p-5 flex flex-col gap-4 shadow-xl">
        <div>
          <h3 className="font-outfit text-base font-semibold text-text">{title}</h3>
          <p className="mt-1 font-roboto text-sm text-text-muted">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-text/15 py-2 font-roboto text-sm text-text-muted hover:border-text/30 hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-500/80 py-2 font-roboto text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Row ────────────────────────────────────────────────────────────────────

interface DiaryEntryRowProps {
  entry: DiaryEntryData
  isOwner: boolean
  onDelete: (id: string) => void
  onEdit: (updated: DiaryEntryData) => void
}

export default function DiaryEntryRow({ entry, isOwner, onDelete, onEdit }: DiaryEntryRowProps) {
  const [deleting,     setDeleting]     = useState(false)
  const [showEdit,     setShowEdit]     = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)

  const { day, weekday } = parseDate(entry.watchedAt)
  const year = releaseYear(entry.movie.releaseDate)
  const posterSrc = entry.movie.posterPath ? tmdbPoster(entry.movie.posterPath, 'w185') : null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/diary/${entry.id}`)
      onDelete(entry.id)
    } catch {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <article className="group flex items-center gap-3 border-b border-text/10 py-3 last:border-0">
        {/* Date badge */}
        <div className="min-w-10 shrink-0 rounded-lg bg-surface-2 px-2 py-1 text-center">
          <p className="font-outfit text-lg font-bold leading-none text-text">{day}</p>
          <p className="hidden font-roboto text-[10px] text-text-muted sm:block">{weekday}</p>
        </div>

        {/* Poster */}
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

        {/* Info */}
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

        {/* Actions — desktop: appear on row hover */}
        {isOwner && (
          <>
            <div className="hidden shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                aria-label="Edit entry"
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={deleting}
                aria-label="Delete entry"
                className="rounded-lg p-1.5 text-text-muted hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Mobile/tablet: always visible, no hover */}
            <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                aria-label="Edit entry"
                className="rounded-lg p-2 text-text-muted active:bg-surface-2"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={deleting}
                aria-label="Delete entry"
                className="rounded-lg p-2 text-text-muted active:text-red-400 disabled:opacity-40"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        )}
      </article>

      {showEdit && (
        <EditModal
          entry={entry}
          onClose={() => setShowEdit(false)}
          onSaved={onEdit}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          title="Remove from diary"
          message={`Remove "${entry.movie.title}" from your diary? This can't be undone.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
