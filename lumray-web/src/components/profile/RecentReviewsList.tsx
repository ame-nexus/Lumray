'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'
import { tmdbPoster } from '@/lib/tmdbImage'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface RecentReviewsListProps {
  username: string
  reviews: {
    id: string
    movie: { id: string; title: string; posterPath: string | null; releaseDate: string | null }
    content: string
    rating: number | null
    createdAt: string
    _count: { likes: number; comments: number }
    isRewatch?: boolean
  }[]
}

function releaseYear(releaseDate: string | null): string | null {
  if (!releaseDate) return null
  const year = releaseDate.slice(0, 4)
  return /^\d{4}$/.test(year) ? year : null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ProfileReviewCard({
  review,
}: {
  review: RecentReviewsListProps['reviews'][number]
}) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  const year = releaseYear(review.movie.releaseDate)
  const posterSrc = review.movie.posterPath
    ? tmdbPoster(review.movie.posterPath, 'w300')
    : null

  return (
    <article className="flex gap-4 border-b border-text/10 py-5 last:border-0">
      <Link href={`/films/${review.movie.id}`} className="shrink-0">
        <div className="relative h-22 w-16 overflow-hidden rounded-lg bg-surface-2 sm:h-28 sm:w-20">
          {posterSrc ? (
            <Image
              src={posterSrc}
              alt={review.movie.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-1 text-center">
              <span className="font-roboto text-[10px] text-text-muted">{review.movie.title}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-outfit text-sm font-bold uppercase tracking-wide text-text">
              {review.movie.title}
              {year && (
                <span className="ml-2 font-roboto text-xs font-normal normal-case tracking-normal text-text-muted">
                  {year}
                </span>
              )}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {review.rating != null && <StarRating value={review.rating} size={14} />}
              <span className="font-roboto text-xs text-text-muted">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
          {review.isRewatch && (
            <span className="rounded-full bg-purple/20 px-2 py-0.5 font-roboto text-xs text-purple-light">
              Watched
            </span>
          )}
        </div>

        <p className="mt-2 font-roboto text-sm leading-relaxed text-text-dim line-clamp-3">
          {review.content}
        </p>

        <div className="mt-3 flex items-center gap-4 font-roboto text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Heart size={12} />
            {review._count.likes} {t.profile.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={12} />
            {review._count.comments} {t.profile.comments}
          </span>
        </div>
      </div>
    </article>
  )
}

export default function RecentReviewsList({ username, reviews }: RecentReviewsListProps) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-lg font-semibold text-text">{t.profile.recentReviews}</h2>
        {reviews.length > 0 && (
          <Link
            href={`/profile/${username}/reviews`}
            className="font-roboto text-sm text-purple-light transition-colors hover:text-text"
          >
            {t.profile.more}
          </Link>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="py-6 font-roboto text-sm text-text-muted">{t.profile.noReviews}</p>
      ) : (
        <div>
          {reviews.map((review) => (
            <ProfileReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  )
}
