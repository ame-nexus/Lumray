'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

export interface CommunityReviewItem {
  content: string
  rating: number
  user: { username: string; avatar: string }
  movie: { title: string; posterPath: string }
  likeCount: number
}

export interface CommunityReviewProps {
  reviews: CommunityReviewItem[]
}

function posterUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w500${path}`
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < rating
              ? 'fill-purple-light text-purple-light'
              : 'text-text-muted'
          }
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: CommunityReviewItem }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-text/10 bg-surface md:flex-row">
      {/* Mobile: poster on top */}
      <div className="relative aspect-[2/3] w-full shrink-0 md:hidden">
        <Image
          src={posterUrl(review.movie.posterPath)}
          alt={review.movie.title}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Text — ~65% on desktop */}
      <div className="flex min-w-0 flex-1 flex-col p-5 md:w-[65%] md:p-6">
        <p className="line-clamp-6 flex-1 font-roboto text-sm leading-relaxed text-text md:text-base">
          {review.content}
        </p>
        <Link
          href="#"
          className="mt-2 inline-block font-roboto text-sm text-purple-light hover:text-text transition-colors"
        >
          Read Entire Review
        </Link>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-purple">
              <Image
                src={review.user.avatar}
                alt={review.user.username}
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div>
              <p className="font-outfit text-sm font-medium text-text">
                {review.user.username}
              </p>
              <StarRow rating={review.rating} />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 font-roboto text-sm text-text-muted">
            <Heart size={16} className="text-text-muted" />
            {review.likeCount}
          </span>
        </div>
      </div>

      {/* Desktop: poster — ~35% */}
      <div className="relative hidden aspect-[2/3] w-[35%] shrink-0 md:block">
        <Image
          src={posterUrl(review.movie.posterPath)}
          alt={review.movie.title}
          fill
          sizes="35vw"
          className="rounded-r-xl object-cover"
        />
      </div>
    </article>
  )
}

export default function CommunityReview({ reviews }: CommunityReviewProps) {
  if (reviews.length === 0) return null

  return (
    <section className="w-full">
      <h2 className="mb-6 font-outfit text-xl font-semibold text-text md:text-2xl">
        Community Recommendation
      </h2>

      <div className="community-review-swiper">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={16}
          pagination={{ clickable: true }}
          className="!pb-10"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={`${review.user.username}-${index}`}>
              <ReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .community-review-swiper .swiper-pagination-bullet {
          background: #7a7882;
          opacity: 1;
        }
        .community-review-swiper .swiper-pagination-bullet-active {
          background: #b9a4fc;
          width: 1.5rem;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  )
}

export const COMMUNITY_REVIEW_DUMMY: CommunityReviewItem[] = [
  {
    content:
      'A masterpiece of tension and character. Every frame feels deliberate, and the score stays with you long after the credits. I have rewatched it twice this month and still notice new details in the background performances.',
    rating: 5,
    user: {
      username: 'cinephile_omar',
      avatar: 'https://i.pravatar.cc/150?u=omar',
    },
    movie: { title: 'The Godfather', posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
    likeCount: 128,
  },
  {
    content:
      'Visually stunning and emotionally devastating in the best way. The third act lost me slightly, but the performances carried it home. Would recommend to anyone who loves slow-burn sci-fi with heart.',
    rating: 4,
    user: {
      username: 'filmlover_j',
      avatar: 'https://i.pravatar.cc/150?u=jane',
    },
    movie: { title: 'Interstellar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
    likeCount: 84,
  },
  {
    content:
      'Perfect comfort watch with surprising depth. The humor lands every time, and the friendship at the core feels genuine rather than written for plot convenience.',
    rating: 5,
    user: {
      username: 'popcorn_sam',
      avatar: 'https://i.pravatar.cc/150?u=sam',
    },
    movie: { title: 'Spirited Away', posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg' },
    likeCount: 56,
  },
]
