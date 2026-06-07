export interface DiaryStatsCardProps {
  totalFilms: number
  thisYear: number
  thisMonth: number
  rewatches: number
  firstWatches: number
  avgPerMonth: number
}

const ROWS: { key: keyof DiaryStatsCardProps; label: string }[] = [
  { key: 'totalFilms', label: 'Total films' },
  { key: 'thisYear', label: 'This year' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'rewatches', label: 'Rewatches' },
  { key: 'firstWatches', label: 'First watches' },
  { key: 'avgPerMonth', label: 'Avg per month' },
]

export default function DiaryStatsCard(props: DiaryStatsCardProps) {
  return (
    <section className="rounded-xl bg-surface p-4">
      <h3 className="mb-3 font-outfit text-sm font-semibold text-text">Diary stats</h3>

      <div>
        {ROWS.map(({ key, label }) => {
          const value = props[key]
          const display = key === 'avgPerMonth' ? value.toFixed(1) : String(value)

          return (
            <div
              key={key}
              className="flex items-center justify-between border-b border-text/10 py-1.5 last:border-0"
            >
              <span className="font-roboto text-sm text-text-muted">{label}</span>
              <span className="font-roboto text-sm font-semibold text-text">{display}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
