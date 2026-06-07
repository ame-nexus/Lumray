'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Star } from 'lucide-react'

export interface MovieRatingProps {
  average: number
  totalCount: number
  distribution: { stars: 1 | 2 | 3 | 4 | 5; count: number }[]
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// Generate a bell-curve distribution from a 0-5 average when real data isn't available
function generateDistribution(avg: number): { stars: number; pct: number }[] {
  const sigma = 1.1
  const weights = [1, 2, 3, 4, 5].map(s =>
    Math.exp(-0.5 * Math.pow((s - avg) / sigma, 2))
  )
  const total = weights.reduce((a, b) => a + b, 0)
  return [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    pct: Math.round((weights[s - 1] / total) * 100),
  }))
}

function GaugeChart({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.min(value / max, 1)
  const filled = pct * 100
  const empty = 100 - filled

  return (
    <div className="relative mx-auto h-28 w-56" style={{ minWidth: 0 }}>
      <ResponsiveContainer width={224} height={112}>
        <PieChart>
          <Pie
            data={[
              { value: filled },
              { value: empty },
            ]}
            cx="50%"
            cy="88%"
            startAngle={180}
            endAngle={0}
            innerRadius={52}
            outerRadius={68}
            strokeWidth={0}
            dataKey="value"
          >
            <Cell fill="#714ee4" />
            <Cell fill="#2b2c3e" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Centered label inside arc */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="font-outfit text-4xl font-bold leading-none text-white">
          {value.toFixed(1)}
        </span>
        <span className="font-roboto text-[11px] text-text-muted">out of 5</span>
      </div>
    </div>
  )
}

function StarRow({ stars, pct }: { stars: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex w-16 shrink-0 items-center justify-end gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={9}
            className={i < stars ? 'fill-purple-light text-purple-light' : 'text-surface-2'}
          />
        ))}
      </div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-purple transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right font-roboto text-[11px] text-text-muted">
        {pct}%
      </span>
    </div>
  )
}

export default function MovieRating({ average, totalCount, distribution }: MovieRatingProps) {
  const rows =
    distribution.length > 0
      ? [...distribution]
          .sort((a, b) => b.stars - a.stars)
          .map(r => ({
            stars: r.stars,
            pct: totalCount > 0 ? Math.round((r.count / totalCount) * 100) : 0,
          }))
      : generateDistribution(average)

  return (
    <section className="rounded-xl bg-surface p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-outfit text-sm font-semibold text-text">Ratings</h3>
        <span className="font-roboto text-xs text-text-muted">
          {formatCount(totalCount)} ratings
        </span>
      </div>

      {/* Gauge */}
      <GaugeChart value={average} />

      {/* Stars label */}
      <div className="mb-6 flex justify-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = average >= i + 1
          const half = !filled && average >= i + 0.5
          return (
            <Star
              key={i}
              size={14}
              className={
                filled
                  ? 'fill-purple-light text-purple-light'
                  : half
                  ? 'fill-purple-light/50 text-purple-light/50'
                  : 'text-text-muted'
              }
            />
          )
        })}
      </div>

      {/* Distribution bars */}
      <div className="space-y-3">
        {rows.map(r => (
          <StarRow key={r.stars} stars={r.stars} pct={r.pct} />
        ))}
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
