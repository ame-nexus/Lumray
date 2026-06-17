'use client'

import { useState } from 'react'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface GenreThemesSectionProps {
  genres: string[]
  themes?: string[]
}

type Tab = 'genre' | 'themes'

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-purple-light/30 bg-surface-2 px-4 py-1.5 font-roboto text-sm text-purple-light">
      {label}
    </span>
  )
}

export default function GenreThemesSection({
  genres,
  themes,
}: GenreThemesSectionProps) {
  const [tab, setTab] = useState<Tab>('genre')
  const themeList = themes ?? []
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  return (
    <section>
      <div className="mb-4 flex gap-6 border-b border-text/10">
        <button
          type="button"
          onClick={() => setTab('genre')}
          className={`pb-2 font-outfit text-sm font-medium transition-colors ${
            tab === 'genre'
              ? 'border-b-2 border-purple-light text-purple-light'
              : 'text-text-muted'
          }`}
        >
          {t.movie.genre}
        </button>
        <button
          type="button"
          onClick={() => setTab('themes')}
          className={`pb-2 font-outfit text-sm font-medium transition-colors ${
            tab === 'themes'
              ? 'border-b-2 border-purple-light text-purple-light'
              : 'text-text-muted'
          }`}
        >
          {t.movie.themes}
        </button>
      </div>

      {tab === 'genre' ? (
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <Pill key={g} label={g} />
          ))}
        </div>
      ) : themeList.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {themeList.map((t) => (
            <Pill key={t} label={t} />
          ))}
        </div>
      ) : (
        <p className="font-roboto text-sm text-text-muted">{t.movie.noThemes}</p>
      )}
    </section>
  )
}

export const DUMMY_GENRE_THEMES: GenreThemesSectionProps = {
  genres: ['Drama', 'Coming-of-age', 'Memory'],
  themes: ['Drama', 'Coming-of-age', 'Memory'],
}
