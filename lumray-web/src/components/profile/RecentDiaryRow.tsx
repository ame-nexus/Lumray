import Image from 'next/image'
import Link from 'next/link'
import { tmdbPoster } from '@/lib/tmdbImage'

export interface RecentDiaryRowProps {
  username: string
  entries: {
    id: string
    movie: { id: string; title: string; posterPath: string | null }
    watchedAt: string
    rating: number | null
  }[]
}

export default function RecentDiaryRow({ username, entries }: RecentDiaryRowProps) {
  const visible = entries.slice(0, 4)

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-lg font-semibold text-text">Recent diary entries</h2>
        <Link
          href={`/profile/${username}/diary`}
          className="font-roboto text-sm text-purple-light hover:text-text transition-colors"
        >
          more →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {visible.map((entry) => {
          const src = entry.movie.posterPath
            ? tmdbPoster(entry.movie.posterPath, 'w300')
            : null

          return (
            <Link key={entry.id} href={`/films/${entry.movie.id}`} className="group block">
              <div className="relative aspect-2/3 overflow-hidden rounded-lg shadow-md">
                {src ? (
                  <Image
                    src={src}
                    alt={entry.movie.title}
                    fill
                    sizes="(max-width: 768px) 30vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-surface-2 p-2">
                    <span className="text-center font-roboto text-xs text-text-muted">
                      {entry.movie.title}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
