'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { tmdbPoster } from '@/lib/tmdbImage'
import api from '@/services/api'

interface WatchlistMovie {
  id: string
  tmdbId: number
  title: string
  posterPath: string | null
}

export default function ProfileWatchlistPage() {
  const { username } = useParams<{ username: string }>()
  const [movies,  setMovies]  = useState<WatchlistMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/users/${username}/watchlist?limit=100`)
      .then(r => setMovies(r.data.data ?? []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-text-muted" />
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="px-6 py-20 text-center md:px-12 xl:px-60">
        <p className="font-roboto text-sm text-text-muted">No films in the watchlist yet.</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 md:px-12 xl:px-60">
      <p className="mb-6 font-roboto text-sm text-text-muted">{movies.length} film{movies.length !== 1 ? 's' : ''}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {movies.map((movie) => {
          const src = movie.posterPath ? tmdbPoster(movie.posterPath, 'w300') : null
          return (
            <Link key={movie.id} href={`/films/${movie.tmdbId}`} className="group block">
              <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface-2">
                {src ? (
                  <Image
                    src={src}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 14vw"
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
      </div>
    </div>
  )
}
