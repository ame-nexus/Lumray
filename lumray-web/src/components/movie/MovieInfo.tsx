'use client'

import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface MovieInfoProps {
  director?: string
  writers?: string[]
  cinematography?: string
  music?: string
  runtime?: number
  language?: string
  country?: string
  studio?: string
  released?: string
}

export function formatRuntime(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

interface InfoRowProps {
  label: string
  value: string
  link?: boolean
}

function InfoRow({ label, value, link }: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-text/5 py-1.5 last:border-0">
      <span className="shrink-0 font-roboto text-xs text-text-muted">{label}</span>
      <span
        className={`text-right font-roboto text-xs ${
          link ? 'text-purple-light' : 'text-text'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function MovieInfo({
  director,
  writers,
  cinematography,
  music,
  runtime,
  language,
  country,
  studio,
  released,
}: MovieInfoProps) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  const rows: { label: string; value: string; link?: boolean }[] = []

  if (director) rows.push({ label: t.movie.director, value: director, link: true })
  if (writers?.length) {
    rows.push({ label: writers.length === 1 ? t.movie.writer : t.movie.writers, value: writers.join(', '), link: true })
  }
  if (cinematography) rows.push({ label: t.movie.cinematography, value: cinematography })
  if (music) rows.push({ label: t.movie.music, value: music })
  if (runtime != null) rows.push({ label: t.movie.runtime, value: formatRuntime(runtime) })
  if (language) rows.push({ label: t.movie.language, value: language })
  if (country) rows.push({ label: 'Country', value: country })
  if (studio) rows.push({ label: 'Studio', value: studio })
  if (released) rows.push({ label: t.movie.released, value: released })

  return (
    <section className="rounded-xl bg-surface p-5">
      <h3 className="mb-3 font-outfit text-sm font-semibold text-text">{t.movie.info}</h3>
      <div>
        {rows.map((row) => (
          <InfoRow key={row.label} {...row} />
        ))}
      </div>
    </section>
  )
}

export const DUMMY_MOVIE_INFO: MovieInfoProps = {
  director: 'Charlotte Wells',
  writers: ['Charlotte Wells'],
  cinematography: 'Gregory Oke',
  music: 'Oliver Coates',
  runtime: 102,
  language: 'English',
  country: 'UK / USA',
  studio: 'A24, BBC Film',
  released: 'Oct 28, 2022',
}
