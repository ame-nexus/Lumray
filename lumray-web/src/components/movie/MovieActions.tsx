'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, ChevronRight, Eye, Heart, Star, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

export interface MovieActionsProps {
  movieId: string
  isWatched?: boolean
  isFavourite?: boolean
  isWatchlisted?: boolean
  userRating?: number
}

const ACTION_LINKS = [
  'Review or Log',
  'Add to lists',
  'Change Poster/Backdrop',
  'Share',
] as const

function StarPicker({
  value,
  hover,
  onHover,
  onPick,
  onRequireAuth,
}: {
  value: number
  hover: number
  onHover: (n: number) => void
  onPick: (n: number) => void
  onRequireAuth: () => boolean
}) {
  const display = hover > 0 ? hover : value

  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        const filled = display >= star
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(0)}
            onClick={() => {
              if (onRequireAuth()) return
              onPick(star)
            }}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              size={22}
              className={
                filled ? 'fill-purple-light text-purple-light' : 'text-text-muted'
              }
            />
          </button>
        )
      })}
    </div>
  )
}

interface ToggleRowProps {
  compact?: boolean
  watched: boolean
  favourite: boolean
  watchlisted: boolean
  onToggleWatched: () => void
  onToggleFavourite: () => void
  onToggleWatchlist: () => void
}

function ToggleRow({
  compact,
  watched,
  favourite,
  watchlisted,
  onToggleWatched,
  onToggleFavourite,
  onToggleWatchlist,
}: ToggleRowProps) {
  const buttons = [
    { key: 'watched', label: 'Watched', icon: Eye, active: watched, onClick: onToggleWatched, hideLabelOnMobile: false },
    { key: 'favourite', label: 'Favourite', icon: Heart, active: favourite, onClick: onToggleFavourite, hideLabelOnMobile: true },
    { key: 'watchlist', label: 'Watchlist', icon: Bookmark, active: watchlisted, onClick: onToggleWatchlist, hideLabelOnMobile: true },
  ] as const

  return (
    <div
      className={`flex items-center ${compact ? 'justify-start gap-3' : 'justify-between'}`}
    >
      {buttons.map(({ key, label, icon: Icon, active, onClick, hideLabelOnMobile }) => (
        <button
          key={key}
          type="button"
          onClick={onClick}
          className="flex flex-col items-center gap-1.5"
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 transition-colors ${
              active ? 'border border-purple text-purple' : ''
            }`}
          >
            <Icon size={20} className={active ? 'text-purple' : 'text-text'} />
          </span>
          {(!compact || !hideLabelOnMobile) && (
            <span className="font-roboto text-[10px] text-text-muted">{label}</span>
          )}
          {compact && hideLabelOnMobile && <span className="sr-only">{label}</span>}
        </button>
      ))}
    </div>
  )
}

function ActionLinks({
  onAction,
}: {
  onAction: (label: string) => void
}) {
  return (
    <div className="divide-y divide-text/10">
      {ACTION_LINKS.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onAction(label)}
          className="w-full py-2.5 font-roboto text-sm text-text transition-colors hover:text-purple-light"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function MovieActions({
  movieId,
  isWatched: initialWatched = false,
  isFavourite: initialFavourite = false,
  isWatchlisted: initialWatchlisted = false,
  userRating: initialRating = 0,
}: MovieActionsProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const [watched, setWatched] = useState(initialWatched)
  const [favourite, setFavourite] = useState(initialFavourite)
  const [watchlisted, setWatchlisted] = useState(initialWatchlisted)
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)

  const requireAuth = (): boolean => {
    if (user) return false
    router.push('/login')
    return true
  }

  const handleAction = (label: string) => {
    if (requireAuth()) return
    void label
    void movieId
  }

  const toggleProps: ToggleRowProps = {
    watched,
    favourite,
    watchlisted,
    onToggleWatched: () => {
      if (requireAuth()) return
      setWatched((v) => !v)
    },
    onToggleFavourite: () => {
      if (requireAuth()) return
      setFavourite((v) => !v)
    },
    onToggleWatchlist: () => {
      if (requireAuth()) return
      setWatchlisted((v) => !v)
    },
  }

  const desktopCard = (
    <div className="hidden rounded-xl bg-surface p-5 lg:block">
      <ToggleRow {...toggleProps} />
      <div className="my-5">
        <StarPicker
          value={rating}
          hover={hoverRating}
          onHover={setHoverRating}
          onPick={setRating}
          onRequireAuth={requireAuth}
        />
      </div>
      <ActionLinks onAction={handleAction} />
    </div>
  )

  const mobileStrip = (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 lg:hidden">
      <ToggleRow compact {...toggleProps} />
      <button
        type="button"
        onClick={() => {
          if (requireAuth()) return
          setSheetOpen(true)
        }}
        className="inline-flex items-center gap-1 rounded-full bg-purple px-4 py-2 font-roboto text-sm font-medium text-white"
      >
        Rate &amp; Log
        <ChevronRight size={16} />
      </button>
    </div>
  )

  const bottomSheet = sheetOpen && (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-bg-darker/80"
        aria-label="Close"
        onClick={() => setSheetOpen(false)}
      />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-text/10 bg-surface p-6 pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-outfit text-lg font-semibold text-text">Rate &amp; Log</h3>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="rounded-lg p-1 text-text-muted hover:bg-text/10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-6">
          <StarPicker
            value={rating}
            hover={hoverRating}
            onHover={setHoverRating}
            onPick={setRating}
            onRequireAuth={requireAuth}
          />
        </div>
        <div className="divide-y divide-text/10">
          <button
            type="button"
            onClick={() => handleAction('Review or Log')}
            className="w-full py-3 text-left font-roboto text-sm text-text hover:text-purple-light"
          >
            Review or Log
          </button>
          <button
            type="button"
            onClick={() => handleAction('Add to lists')}
            className="w-full py-3 text-left font-roboto text-sm text-text hover:text-purple-light"
          >
            Add to lists
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {desktopCard}
      {mobileStrip}
      {bottomSheet}
    </>
  )
}

export const DUMMY_MOVIE_ACTIONS: MovieActionsProps = {
  movieId: '965150',
  isWatched: false,
  isFavourite: true,
  isWatchlisted: false,
  userRating: 4,
}
