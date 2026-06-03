'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { nameInitials, tmdbPoster } from '@/lib/tmdbImage'

export interface CastMember {
  id: string
  name: string
  character?: string
  profilePath?: string | null
}

export interface CrewMember {
  id: string
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
  name,
  sublabel,
  profilePath,
}: {
  name: string
  sublabel: string
  profilePath?: string | null
}) {
  const src = profilePath ? tmdbPoster(profilePath, 'w185') : null

  return (
    <div className="flex w-20 shrink-0 flex-col items-center sm:w-24">
      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-surface-2">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" sizes="64px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-outfit text-sm font-semibold text-text-muted">
            {nameInitials(name)}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-center font-outfit text-xs font-semibold leading-tight text-text">
        {name}
      </p>
      <p className="mt-0.5 line-clamp-2 text-center font-roboto text-xs text-text-muted">
        {sublabel}
      </p>
    </div>
  )
}

export default function CastCrewSection({ cast, crew }: CastCrewSectionProps) {
  const [tab, setTab] = useState<Tab>('cast')
  const people =
    tab === 'cast'
      ? cast.slice(0, 5).map((p) => ({
          key: p.id,
          name: p.name,
          sublabel: p.character ?? '',
          profilePath: p.profilePath,
        }))
      : crew.slice(0, 5).map((p) => ({
          key: p.id,
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
            className={`pb-2 font-outfit text-sm font-medium transition-colors ${
              tab === 'cast'
                ? 'border-b-2 border-purple-light text-purple-light'
                : 'text-text-muted'
            }`}
          >
            Cast
          </button>
          <button
            type="button"
            onClick={() => setTab('crew')}
            className={`pb-2 font-outfit text-sm font-medium transition-colors ${
              tab === 'crew'
                ? 'border-b-2 border-purple-light text-purple-light'
                : 'text-text-muted'
            }`}
          >
            Crew
          </button>
        </div>
        <Link
          href="#"
          className="shrink-0 font-roboto text-xs text-purple-light underline"
        >
          see full cast →
        </Link>
      </div>

      <div
        className="overflow-x-auto pb-1 md:overflow-visible"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex w-max gap-4 md:w-full md:justify-between">
          {people.map((person) => (
            <PersonCircle key={person.key} {...person} />
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
