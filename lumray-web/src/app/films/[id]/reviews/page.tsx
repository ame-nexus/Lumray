'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ReviewCard from '@/components/movie/ReviewCard'
import api from '@/services/api'

interface ApiReview {
  id: string
  content: string
  rating: number | null
  createdAt: string
  isLiked: boolean
  user: { id: string; username: string; avatar: string | null }
  _count: { likes: number; comments: number }
}

interface Movie {
  id: string
  tmdbId: number
  title: string
}

export default function FilmReviewsPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const tmdbId    = parseInt(id)

  const [movie,   setMovie]   = useState<Movie | null>(null)
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isNaN(tmdbId)) { router.replace('/films'); return }

    api.get(`/api/movies/${tmdbId}`)
      .then(res => {
        const m: Movie = res.data.data
        setMovie(m)
        return api.get(`/api/reviews`, { params: { movieId: m.id } })
      })
      .then(res => setReviews(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tmdbId, router])

  return (
    <main className="px-4 py-8 md:px-12 xl:px-60">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 font-roboto text-sm text-text-muted hover:text-text transition-colors w-fit"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Title */}
        <div>
          <h1 className="font-outfit text-2xl font-bold text-text">
            Reviews
          </h1>
          {movie && (
            <Link href={`/films/${movie.tmdbId}`} className="font-roboto text-sm text-purple-light hover:text-purple-mid transition-colors">
              {movie.title}
            </Link>
          )}
        </div>

        {/* Reviews */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-roboto text-text-muted">No reviews yet for this film.</p>
            {movie && (
              <Link
                href={`/films/${movie.tmdbId}`}
                className="mt-4 inline-block rounded-full bg-purple px-5 py-2 font-roboto text-sm text-white hover:bg-purple-deep transition-colors"
              >
                Be the first to review
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="font-roboto text-sm text-text-muted">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
            {reviews.map(r => (
              <ReviewCard
                key={r.id}
                id={r.id}
                user={r.user}
                rating={r.rating}
                content={r.content}
                likeCount={r._count.likes}
                commentCount={r._count.comments}
                createdAt={new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                isLiked={r.isLiked}
                onDeleted={() => setReviews(prev => prev.filter(rev => rev.id !== r.id))}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
