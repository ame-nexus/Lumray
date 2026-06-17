'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { nameInitials, tmdbPoster } from '@/lib/tmdbImage'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface CastMember {
  id: string
  tmdbId: number
  name: string
  character?: string
  profilePath?: string | null
}

export interface CrewMember {
  id: string
  tmdbId: number
  name: string
  job: string
  profilePath?: string | null
}

export interface CastCrewSectionProps {
  cast: CastMember[]
  crew: CrewMember[]
}

type Tab = 'cast' | 'crew'

function PersonCircle({
  tmdbId,
  name,
  sublabel,
  profilePath,
}: {
  tmdbId: number
  name: string
  sublabel: string
  profilePath?: string | null
}) {
  const src = profilePath ? tmdbPoster(profilePath, 'w185') : null

  return (
    <Link href={`/person/${tmdbId}`} className="flex w-24 shrink-0 flex-col items-center group lg:w-28 xl:w-32">
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[#2b2c3e] ring-1 ring-white/10 transition-all group-hover:ring-2 group-hover:ring-purple-light lg:h-28 lg:w-28 xl:h-32 xl:w-32">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover object-center transition-transform group-hover:scale-105" sizes="146px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-outfit text-sm font-semibold text-text-dim">
            {nameInitials(name)}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-center font-outfit text-xs font-semibold leading-tight text-text group-hover:text-purple-light transition-colors">
        {name}
      </p>
      <p className="mt-0.5 line-clamp-2 text-center font-roboto text-[11px] text-text-muted">
        {sublabel}
      </p>
    </Link>
  )
}

export default function CastCrewSection({ cast, crew }: CastCrewSectionProps) {
  const [tab, setTab] = useState<Tab>('cast')
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  const people =
    tab === 'cast'
      ? cast.slice(0, 6).map((p) => ({
          key: p.id,
          tmdbId: p.tmdbId,
          name: p.name,
          sublabel: p.character ?? '',
          profilePath: p.profilePath,
        }))
      : crew.slice(0, 6).map((p) => ({
          key: p.id,
          tmdbId: p.tmdbId,
          name: p.name,
          sublabel: p.job,
          profilePath: p.profilePath,
        }))

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-text/10">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setTab('cast')}
            className={`pb-2 font-outfit text-sm font-semibold transition-colors ${
              tab === 'cast'
                ? 'border-b-2 border-purple-light text-text'
                : 'text-text-muted hover:text-text-dim'
            }`}
          >
            {t.movie.cast}
          </button>
          <button
            type="button"
            onClick={() => setTab('crew')}
            className={`pb-2 font-outfit text-sm font-semibold transition-colors ${
              tab === 'crew'
                ? 'border-b-2 border-purple-light text-text'
                : 'text-text-muted hover:text-text-dim'
            }`}
          >
            {t.movie.crew}
          </button>
        </div>
        <Link
          href="#"
          className="shrink-0 font-roboto text-xs text-purple-light underline"
        >
          {t.movie.fullCast}
        </Link>
      </div>

      <div className="overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-3 lg:justify-between">
          {people.map(({ key, ...person }, index) => (
            <div key={key} className={index >= 5 ? 'hidden 2xl:flex' : index >= 4 ? 'hidden xl:flex' : ''}>
              <PersonCircle {...person} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const DUMMY_CAST: CastMember[] = [
  {
    id: '1',
    name: 'Paul Mescal',
    character: 'Calum',
    profilePath: '/b7VqTXyX22CzeT2z4wZyEjB9gY8.jpg',
  },
  {
    id: '2',
    name: 'Frankie Corio',
    character: 'Sophie',
    profilePath: '/8ny1j7vntr3PGIHQCYpEmRrY1Zq.jpg',
  },
  {
    id: '3',
    name: 'Celia Rowson-Hall',
    character: 'Adult Sophie',
    profilePath: null,
  },
  {
    id: '4',
    name: 'Brooklyn Toulson',
    character: 'Michael',
    profilePath: '/5QfZttKZFr2ylBrQJqWVXu8Gd8H.jpg',
  },
  {
    id: '5',
    name: 'Penelope Kirby',
    character: 'Em',
    profilePath: null,
  },
]

export const DUMMY_CREW: CrewMember[] = [
  {
    id: 'c1',
    name: 'Charlotte Wells',
    job: 'Director',
    profilePath: null,
  },
  {
    id: 'c2',
    name: 'Gregory Oke',
    job: 'Director of Photography',
    profilePath: null,
  },
  {
    id: 'c3',
    name: 'Oliver Coates',
    job: 'Original Music Composer',
    profilePath: null,
  },
  {
    id: 'c4',
    name: 'Charlotte Wells',
    job: 'Writer',
    profilePath: null,
  },
  {
    id: 'c5',
    name: 'Amy Jackson',
    job: 'Producer',
    profilePath: null,
  },
]

export const DUMMY_CAST_CREW: CastCrewSectionProps = {
  cast: DUMMY_CAST,
  crew: DUMMY_CREW,
}
