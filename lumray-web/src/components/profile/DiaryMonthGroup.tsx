import Image from 'next/image'
import Link from 'next/link'
import DiaryEntryRow, { type DiaryEntryData } from '@/components/profile/DiaryEntryRow'
import { tmdbPoster } from '@/lib/tmdbImage'

export interface DiaryMonthGroupProps {
  month: string
  entries: DiaryEntryData[]
  view: 'list' | 'grid'
}

export default function DiaryMonthGroup({ month, entries, view }: DiaryMonthGroupProps) {
  return (
    <section className="mb-8">
      <h3 className="mb-3 font-outfit text-sm font-semibold text-text-muted">{month}</h3>

      {view === 'list' ? (
        <div>
          {entries.map((entry) => (
            <DiaryEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {entries.map((entry) => {
            const src = entry.movie.posterPath
              ? tmdbPoster(entry.movie.posterPath, 'w300')
              : null

            return (
              <Link key={entry.id} href={`/films/${entry.movie.id}`} className="group block">
                <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface-2">
                  {src ? (
                    <Image
                      src={src}
                      alt={entry.movie.title}
                      fill
                      sizes="(max-width: 768px) 45vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center">
                      <span className="font-roboto text-xs text-text-muted">
                        {entry.movie.title}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
