'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import ReviewCard from '@/components/movie/ReviewCard'
import type { ReviewCardProps } from '@/components/movie/ReviewCard'
import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'
import { tmdbPoster } from '@/lib/tmdbImage'
import api from '@/services/api'

interface Review {
  id: string
  content: string
  rating: number | null
  createdAt: string
  isLiked: boolean
  user: { id: string; username: string; avatar: string | null }
  _count: { likes: number; comments: number }
  userId: string
  movie: { id: string; tmdbId: number; title: string; posterPath: string | null; releaseDate: string | null }
}

function ReviewRow({ review, onDeleted }: { review: Review; onDeleted: () => void }) {
  const year = review.movie.releaseDate?.slice(0, 4) ?? null
  const src  = review.movie.posterPath ? tmdbPoster(review.movie.posterPath, 'w300') : null
  const date = new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const cardProps: ReviewCardProps = {
    id:           review.id,
    user:         review.user,
    rating:       review.rating,
    content:      review.content,
    likeCount:    review._count.likes,
    commentCount: review._count.comments,
    createdAt:    date,
    isLiked:      review.isLiked,
    onDeleted,
  }

  return (
    <div className="flex gap-4 border-b border-text/10 py-5 last:border-0">
      <Link href={`/films/${review.movie.tmdbId}`} className="shrink-0">
        <div className="relative h-24 w-16 overflow-hidden rounded-lg bg-surface-2 sm:h-28 sm:w-20">
          {src ? (
            <Image src={src} alt={review.movie.title} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="flex h-full items-center justify-center p-1 text-center">
              <span className="font-roboto text-[10px] text-text-muted">{review.movie.title}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="font-outfit text-sm font-bold uppercase tracking-wide text-text">
          {review.movie.title}
          {year && <span className="ml-2 font-roboto text-xs font-normal normal-case tracking-normal text-text-muted">{year}</span>}
        </h3>
        {review.rating != null && (
          <div className="mt-1">
            <StarRating value={review.rating} size={14} />
          </div>
        )}
        <div className="mt-3">
          <ReviewCard {...cardProps} />
        </div>
      </div>
    </div>
  )
}

export default function ProfileReviewsPage() {
  const params   = useParams<{ username: string }>()
  const username = params.username

  const [reviews, setReviews]       = useState<Review[]>([])
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)

  function load(p: number) {
    setLoading(true)
    api.get(`/api/users/${username}/reviews`, { params: { page: p, limit: 10 } })
      .then(res => {
        const d = res.data.data
        setReviews(d.reviews ?? [])
        setTotalPages(d.totalPages ?? 1)
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [username, page])

  function onDeleted(id: string) {
    setReviews(rs => rs.filter(r => r.id !== id))
  }

  return (
    <ProfileTwoColumn
      main={
        <div className="rounded-xl border border-text/10 bg-surface p-6">
          <h2 className="mb-4 font-outfit text-lg font-semibold text-text">Reviews</h2>

          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 border-b border-text/10 pb-5 last:border-0">
                  <div className="h-24 w-16 shrink-0 animate-pulse rounded-lg bg-surface-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
                    <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-surface-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-12 text-center font-roboto text-sm text-text-muted">No reviews yet.</p>
          ) : (
            <>
              <div>
                {reviews.map(r => (
                  <ReviewRow key={r.id} review={r} onDeleted={() => onDeleted(r.id)} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => { setPage(p => Math.max(1, p - 1)) }}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg border border-text/15 px-3 py-1.5 font-roboto text-sm text-text disabled:opacity-40"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span className="font-roboto text-sm text-text-muted">{page} / {totalPages}</span>
                  <button
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)) }}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 rounded-lg border border-text/15 px-3 py-1.5 font-roboto text-sm text-text disabled:opacity-40"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      }
    />
  )
}
