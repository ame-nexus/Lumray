'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Star, StarHalf } from 'lucide-react'
import api from '@/services/api'

interface ReviewModalProps {
  movieId: string
  movieTitle: string
  initialRating?: number
  onClose: () => void
  onSaved: () => void
}

function nextRating(current: number, star: number): number {
  if (current === star)        return star - 0.5
  if (current === star - 0.5)  return star - 1
  return star
}

export default function ReviewModal({ movieId, movieTitle, initialRating = 0, onClose, onSaved }: ReviewModalProps) {
  const [content, setContent] = useState('')
  const [rating,  setRating]  = useState(initialRating)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const hasReview = content.trim().length > 0

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      // Always log to diary
      await api.post('/api/diary', { movieId, rating: rating || null, isRewatch: false })

      // Only create a review if text was written
      if (hasReview) {
        await api.post('/api/reviews', {
          movieId,
          content: content.trim(),
          rating: rating || null,
        })
      }

      window.dispatchEvent(new CustomEvent('lumray:review-saved', { detail: { movieId } }))
      onSaved()
      onClose()
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-surface-2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-outfit text-base font-bold text-white">Review or Log</h2>
            <p className="font-roboto text-xs text-text-muted">{movieTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-text-muted hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }, (_, i) => {
              const star = i + 1
              const isFull = rating >= star
              const isHalf = !isFull && rating >= star - 0.5
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(nextRating(rating, star))}
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
            {rating > 0 && (
              <span className="ml-2 font-roboto text-sm text-text-muted">{rating} / 5</span>
            )}
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write a review… (optional)"
            rows={5}
            className="w-full resize-none rounded-xl border border-white/10 bg-surface px-4 py-3 font-roboto text-sm text-text placeholder-text-muted outline-none focus:border-purple-light"
          />

          {error && <p className="font-roboto text-xs text-red-400">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-5 py-2 font-roboto text-sm text-text hover:bg-white/5">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="rounded-full bg-purple px-5 py-2 font-roboto text-sm font-medium text-white hover:bg-purple-deep disabled:opacity-50"
            >
              {saving ? 'Saving…' : hasReview ? 'Publish review' : 'Log film'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
