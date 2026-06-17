'use client'

import { useState } from 'react'
import MoviePoster from '@/components/films/MoviePoster'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

interface RoleMovie {
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string | null
  detail: string
}

interface RoleGroup {
  job: string
  movies: RoleMovie[]
}

export default function PersonTabs({ roles }: { roles: RoleGroup[] }) {
  const [activeJob, setActiveJob] = useState(roles[0]?.job ?? '')
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  if (roles.length === 0) {
    return <p className="font-roboto text-sm text-text-muted">{t.person.noCredits}</p>
  }

  const activeRole = roles.find(r => r.job === activeJob)

  return (
    <section>
      <h2 className="mb-4 font-outfit text-lg font-semibold text-text">{t.person.filmography}</h2>

      {/* Tab bar */}
      <div
        className="mb-6 flex gap-1 overflow-x-auto border-b border-text/10 pb-px"
        style={{ scrollbarWidth: 'none' }}
      >
        {roles.map(role => (
          <button
            key={role.job}
            type="button"
            onClick={() => setActiveJob(role.job)}
            className={`-mb-px shrink-0 rounded-t-lg px-4 py-2 font-outfit text-sm font-semibold transition-colors ${
              activeJob === role.job
                ? 'border-b-2 border-purple-light text-text'
                : 'text-text-muted hover:text-text-dim'
            }`}
          >
            {role.job}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 font-roboto text-[10px] ${
              activeJob === role.job ? 'bg-purple/30 text-purple-light' : 'bg-surface text-text-muted'
            }`}>
              {role.movies.length}
            </span>
          </button>
        ))}
      </div>

      {/* Film grid */}
      {activeRole && (
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {activeRole.movies.map(movie => (
            <div key={`${movie.tmdbId}-${movie.detail}`} className="flex flex-col gap-1.5">
              <MoviePoster
                id={movie.tmdbId}
                title={movie.title}
                posterPath={movie.posterPath}
                year={movie.releaseDate?.slice(0, 4)}
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
              />
              <div>
                <p className="font-outfit text-xs font-semibold leading-tight text-text line-clamp-1">
                  {movie.title}
                </p>
                {movie.detail && activeJob === 'Actor' && (
                  <p className="font-roboto text-[10px] text-text-muted line-clamp-1 italic">
                    {movie.detail}
                  </p>
                )}
                {movie.releaseDate && (
                  <p className="font-roboto text-[10px] text-text-muted">
                    {movie.releaseDate.slice(0, 4)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
