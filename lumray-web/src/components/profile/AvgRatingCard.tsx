import { Star } from 'lucide-react'

export interface AvgRatingCardProps {
  average: number
  totalRatings: number
  distribution: number[]
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
            size={14}
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

export default function AvgRatingCard({
  average,
  totalRatings,
  distribution,
}: AvgRatingCardProps) {
  const maxCount = Math.max(...distribution, 1)

  return (
    <section className="rounded-xl bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-outfit text-sm font-semibold text-text">Avg Rating</h3>
        <span className="font-roboto text-xs text-text-muted">{totalRatings} films</span>
      </div>

      <div className="mb-4 flex items-end gap-2">
        <span className="font-outfit text-4xl font-bold text-text">{average.toFixed(1)}</span>
        <AverageStars average={average} />
      </div>

      <div className="flex h-20 items-end justify-between gap-1.5">
        {distribution.map((count, i) => {
          const heightPct = Math.round((count / maxCount) * 100)

          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-16 w-full items-end">
                <div
                  className="w-full rounded-t bg-purple"
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className="font-roboto text-[10px] text-text-muted">{i + 1}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
