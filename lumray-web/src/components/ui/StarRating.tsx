'use client'

import { Star } from 'lucide-react'

export interface StarRatingProps {
  value: number
  max?: number
  size?: number
  onChange?: (value: number) => void
  className?: string
}

export default function StarRating({
  value,
  max = 5,
  size = 16,
  onChange,
  className = '',
}: StarRatingProps) {
  const interactive = Boolean(onChange)

  return (
    <div
      className={['inline-flex items-center gap-0.5', className].filter(Boolean).join(' ')}
      role={interactive ? 'group' : 'img'}
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        const filled = value >= starValue

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(starValue)}
            className={[
              'transition-colors',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default pointer-events-none',
            ].join(' ')}
            aria-label={interactive ? `Rate ${starValue} stars` : undefined}
          >
            <Star
              size={size}
              className={filled ? 'fill-purple-light text-purple-light' : 'text-text-muted'}
            />
          </button>
        )
      })}
    </div>
  )
}
