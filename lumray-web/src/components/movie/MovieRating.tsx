import { Star } from 'lucide-react'

export interface MovieRatingProps {
  average: number
  totalCount: number
  distribution: { stars: 1 | 2 | 3 | 4 | 5; count: number }[]
}

function formatRatingCount(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K ratings`
  return `${n} ratings`
}

function AverageStars({ average }: { average: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1
        const filled = average >= starIndex
        const half = !filled && average >= starIndex - 0.5

        return (
          <Star
            key={i}
            size={16}
            className={
              filled
                ? 'fill-purple-light text-purple-light'
                : half
                  ? 'fill-purple-light/50 text-purple-light'
                  : 'text-text-muted'
            }
          />
        )
      })}
    </div>
  )
}

export default function MovieRating({
  average,
  totalCount,
  distribution,
}: MovieRatingProps) {
  const sorted = [...distribution].sort((a, b) => b.stars - a.stars)

  return (
    <section className="rounded-xl bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-outfit text-sm font-semibold text-text">Rating</h3>
        <span className="font-roboto text-xs text-text-muted">
          {formatRatingCount(totalCount)}
        </span>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <span className="font-outfit text-5xl font-bold text-white">
          {average.toFixed(1)}
        </span>
        <AverageStars average={average} />
      </div>

      <div className="space-y-2">
        {sorted.map((row) => {
          const pct =
            totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0

          return (
            <div key={row.stars} className="flex items-center gap-2">
              <span className="w-3 shrink-0 font-roboto text-xs text-text-muted">
                {row.stars}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-purple"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-roboto text-xs text-text-muted">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export const DUMMY_RATING: MovieRatingProps = {
  average: 4.5,
  totalCount: 117000,
  distribution: [
    { stars: 5, count: 62000 },
    { stars: 4, count: 32000 },
    { stars: 3, count: 14000 },
    { stars: 2, count: 6000 },
    { stars: 1, count: 3000 },
  ],
}
