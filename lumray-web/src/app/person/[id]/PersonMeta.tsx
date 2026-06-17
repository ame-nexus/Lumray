'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

interface MetaMovie {
  tmdbId: number
  title: string
  posterPath: string | null
}

interface PersonMetaProps {
  birthday: string | null
  deathday: string | null
  placeOfBirth: string | null
  age: number | null
  roleLabels: string[]
  knownFor: MetaMovie[]
  name: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PersonMeta({ birthday, deathday, placeOfBirth, age, roleLabels, knownFor, name }: PersonMetaProps) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  return (
    <div className="flex flex-col justify-end gap-3">
      {roleLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {roleLabels.map(r => (
            <span key={r} className="rounded-full border border-purple-deep/60 bg-purple/20 px-3 py-0.5 font-roboto text-xs text-purple-light">
              {r}
            </span>
          ))}
        </div>
      )}

      <h1 className="font-outfit text-3xl font-bold text-white md:text-4xl xl:text-5xl">
        {name}
      </h1>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-roboto text-sm text-text-muted">
        {birthday && (
          <span>
            {t.person.born} <span className="text-text-dim">{formatDate(birthday)}</span>
            {age !== null && !deathday && (
              <span className="ml-1 text-text-muted">({age} {t.person.yearsOld})</span>
            )}
          </span>
        )}
        {deathday && (
          <span>
            {t.person.died} <span className="text-text-dim">{formatDate(deathday)}</span>
            {age !== null && <span className="ml-1">· {t.person.aged} {age}</span>}
          </span>
        )}
        {placeOfBirth && (
          <span className="text-text-muted">{placeOfBirth}</span>
        )}
      </div>

      {knownFor.length > 0 && (
        <div>
          <p className="mb-2 font-roboto text-xs uppercase tracking-widest text-text-muted">{t.person.knownFor}</p>
          <div className="flex gap-2">
            {knownFor.map(m => (
              <Link key={m.tmdbId} href={`/films/${m.tmdbId}`} className="group relative h-16 w-11 overflow-hidden rounded-md ring-1 ring-white/10 transition-all hover:ring-purple-light">
                {m.posterPath ? (
                  <Image src={`https://image.tmdb.org/t/p/w185${m.posterPath}`} alt={m.title} fill className="object-cover" sizes="44px" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-2 p-1">
                    <span className="text-center font-roboto text-[8px] text-text-muted line-clamp-3">{m.title}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
