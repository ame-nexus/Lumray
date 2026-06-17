'use client'

export interface WatchStreakCardProps {
  currentStreak: number
  personalBest: number
  activeDayIndices: number[]
}

import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export default function WatchStreakCard({
  currentStreak,
  personalBest,
  activeDayIndices,
}: WatchStreakCardProps) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  return (
    <section className="rounded-xl bg-surface p-4">
      <h3 className="mb-3 font-outfit text-sm font-semibold text-text">{t.profile.watchStreak} 🔥</h3>

      <p className="font-outfit text-3xl font-bold text-text">{currentStreak}</p>
      <p className="font-roboto text-xs text-text-muted">{t.profile.daysInARow}</p>
      <p className="mt-2 font-roboto text-xs text-text-muted">{t.profile.personalBest} {personalBest} days</p>

      <div className="mt-3 flex gap-1.5">
        {DAY_LABELS.map((label, i) => (
          <div
            key={`${label}-${i}`}
            className={[
              'flex h-8 w-8 items-center justify-center rounded-full font-roboto text-xs',
              activeDayIndices.includes(i)
                ? 'bg-purple text-white'
                : 'bg-surface-2 text-text-muted',
            ].join(' ')}
          >
            {label}
          </div>
        ))}
      </div>
    </section>
  )
}
