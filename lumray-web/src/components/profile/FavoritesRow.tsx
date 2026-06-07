import Image from 'next/image'
import Link from 'next/link'
import { tmdbPoster } from '@/lib/tmdbImage'

export interface FavoritesRowProps {
  movies: { id: string; title: string; posterPath: string | null }[]
}

export default function FavoritesRow({ movies }: FavoritesRowProps) {
  const slots = movies.length > 0 ? movies.slice(0, 4) : []
  const placeholders = Math.max(0, 4 - slots.length)

  return (
    <section>
      <h2 className="mb-4 font-outfit text-lg font-semibold text-text">Favorites</h2>

      <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible">
        {slots.map((movie) => {
          const src = movie.posterPath ? tmdbPoster(movie.posterPath, 'w300') : null

          return (
            <Link
              key={movie.id}
              href={`/films/${movie.id}`}
              className="group min-w-[28%] shrink-0 md:min-w-0"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface-2">
                {src ? (
                  <Image
                    src={src}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 768px) 28vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center">
                    <span className="font-roboto text-xs text-text-muted">{movie.title}</span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}

        {slots.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="aspect-2/3 min-w-[28%] shrink-0 rounded-lg border border-dashed border-text/20 bg-surface-2/50 md:min-w-0"
            />
          ))}

        {placeholders > 0 &&
          slots.length > 0 &&
          Array.from({ length: placeholders }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="hidden aspect-2/3 rounded-lg border border-dashed border-text/20 bg-surface-2/50 md:block"
            />
          ))}
      </div>
    </section>
  )
}
