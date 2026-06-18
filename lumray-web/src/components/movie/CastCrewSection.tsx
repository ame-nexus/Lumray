'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
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
  onClick,
}: {
  tmdbId: number
  name: string
  sublabel: string
  profilePath?: string | null
  onClick?: () => void
}) {
  const src = profilePath ? tmdbPoster(profilePath, 'w185') : null

  const inner = (
    <>
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[#2b2c3e] ring-1 ring-white/10 transition-all group-hover:ring-2 group-hover:ring-purple-light lg:h-28 lg:w-28 xl:h-32 xl:w-32">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover object-center transition-transform group-hover:scale-105" sizes="146px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-outfit text-sm font-semibold text-text-dim">
            {nameInitials(name)}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-center font-outfit text-xs font-semibold leading-tight text-text transition-colors group-hover:text-purple-light">
        {name}
      </p>
      <p className="mt-0.5 line-clamp-2 text-center font-roboto text-[11px] text-text-muted">
        {sublabel}
      </p>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex w-24 shrink-0 flex-col items-center group lg:w-28 xl:w-32">
        {inner}
      </button>
    )
  }

  return (
    <Link href={`/person/${tmdbId}`} className="flex w-24 shrink-0 flex-col items-center group lg:w-28 xl:w-32">
      {inner}
    </Link>
  )
}

// ── Modal person card (smaller, in grid) ──────────────────────────────────────

function ModalPersonCard({ tmdbId, name, sublabel, profilePath, onClose }: {
  tmdbId: number
  name: string
  sublabel: string
  profilePath?: string | null
  onClose: () => void
}) {
  const src = profilePath ? tmdbPoster(profilePath, 'w185') : null

  return (
    <Link
      href={`/person/${tmdbId}`}
      onClick={onClose}
      className="group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-white/5"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-surface-2 ring-1 ring-white/10 transition-all group-hover:ring-2 group-hover:ring-purple-light sm:h-20 sm:w-20">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover object-center" sizes="80px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-outfit text-sm font-semibold text-text-dim">
            {nameInitials(name)}
          </span>
        )}
      </div>
      <div className="w-full text-center">
        <p className="truncate font-outfit text-[11px] font-semibold text-text transition-colors group-hover:text-purple-light">
          {name}
        </p>
        <p className="truncate font-roboto text-[10px] text-text-muted">{sublabel}</p>
      </div>
    </Link>
  )
}

// ── Full cast/crew modal ───────────────────────────────────────────────────────

function FullListModal({
  tab,
  cast,
  crew,
  onClose,
}: {
  tab: Tab
  cast: CastMember[]
  crew: CrewMember[]
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>(tab)

  const people =
    activeTab === 'cast'
      ? cast.map(p => ({ id: p.id, tmdbId: p.tmdbId, name: p.name, sublabel: p.character ?? '', profilePath: p.profilePath }))
      : crew.map(p => ({ id: p.id, tmdbId: p.tmdbId, name: p.name, sublabel: p.job, profilePath: p.profilePath }))

  return createPortal(
    <>
      <div className="fixed inset-0 z-9998 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-x-4 bottom-0 top-16 z-9999 mx-auto flex max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-bg-dark shadow-2xl md:inset-x-8 md:bottom-8 md:rounded-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-text/10 px-6 py-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('cast')}
              className={`font-outfit text-sm font-semibold transition-colors pb-0.5 border-b-2 ${
                activeTab === 'cast' ? 'border-purple-light text-text' : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              Cast
              <span className="ml-1.5 font-roboto text-xs text-text-muted">({cast.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('crew')}
              className={`font-outfit text-sm font-semibold transition-colors pb-0.5 border-b-2 ${
                activeTab === 'crew' ? 'border-purple-light text-text' : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              Crew
              <span className="ml-1.5 font-roboto text-xs text-text-muted">({crew.length})</span>
            </button>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted transition-colors hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-5 md:grid-cols-6">
            {people.map(p => (
              <ModalPersonCard
                key={p.id}
                tmdbId={p.tmdbId}
                name={p.name}
                sublabel={p.sublabel}
                profilePath={p.profilePath}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CastCrewSection({ cast, crew }: CastCrewSectionProps) {
  const [tab,       setTab]       = useState<Tab>('cast')
  const [modalOpen, setModalOpen] = useState(false)
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  const people =
    tab === 'cast'
      ? cast.slice(0, 6).map(p => ({ key: p.id, tmdbId: p.tmdbId, name: p.name, sublabel: p.character ?? '', profilePath: p.profilePath }))
      : crew.slice(0, 6).map(p => ({ key: p.id, tmdbId: p.tmdbId, name: p.name, sublabel: p.job, profilePath: p.profilePath }))

  const total = tab === 'cast' ? cast.length : crew.length

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

        {total > 6 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 font-roboto text-xs text-purple-light underline underline-offset-2 transition-colors hover:text-purple-mid"
          >
            {t.movie.fullCast} →
          </button>
        )}
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

      {modalOpen && (
        <FullListModal
          tab={tab}
          cast={cast}
          crew={crew}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  )
}

export const DUMMY_CAST: CastMember[] = [
  { id: '1', tmdbId: 1241283, name: 'Paul Mescal',    character: 'Calum',        profilePath: '/b7VqTXyX22CzeT2z4wZyEjB9gY8.jpg' },
  { id: '2', tmdbId: 1398159, name: 'Frankie Corio',  character: 'Sophie',       profilePath: '/8ny1j7vntr3PGIHQCYpEmRrY1Zq.jpg' },
  { id: '3', tmdbId: 98765,   name: 'Celia Rowson-Hall', character: 'Adult Sophie', profilePath: null },
  { id: '4', tmdbId: 98766,   name: 'Brooklyn Toulson', character: 'Michael',    profilePath: '/5QfZttKZFr2ylBrQJqWVXu8Gd8H.jpg' },
  { id: '5', tmdbId: 98767,   name: 'Penelope Kirby', character: 'Em',           profilePath: null },
]

export const DUMMY_CREW: CrewMember[] = [
  { id: 'c1', tmdbId: 98771, name: 'Charlotte Wells', job: 'Director',                    profilePath: null },
  { id: 'c2', tmdbId: 98772, name: 'Gregory Oke',     job: 'Director of Photography',    profilePath: null },
  { id: 'c3', tmdbId: 98773, name: 'Oliver Coates',   job: 'Original Music Composer',    profilePath: null },
  { id: 'c4', tmdbId: 98771, name: 'Charlotte Wells', job: 'Writer',                     profilePath: null },
  { id: 'c5', tmdbId: 98774, name: 'Amy Jackson',     job: 'Producer',                   profilePath: null },
]

export const DUMMY_CAST_CREW: CastCrewSectionProps = {
  cast: DUMMY_CAST,
  crew: DUMMY_CREW,
}
