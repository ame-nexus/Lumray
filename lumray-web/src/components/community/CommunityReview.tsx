'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper'
import 'swiper/css'

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
          className={i < rating ? 'fill-purple-light text-purple-light' : 'text-text-muted'}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: CommunityReviewItem }) {
  return (
    <article className="flex overflow-hidden rounded-xl bg-surface h-56 md:h-64">
      {/* Text column */}
      <div className="flex flex-1 flex-col justify-between p-4 md:p-5 overflow-hidden">
        <div className="overflow-hidden">
          <p className="line-clamp-3 font-roboto text-sm leading-relaxed text-text md:line-clamp-5 md:text-base">
            {review.content}
          </p>
          <Link href="#" className="mt-1 inline-block font-roboto text-xs font-semibold text-purple-light hover:text-text/80 transition-colors md:text-sm md:mt-2">
            ... Read Entire Review
          </Link>
        </div>

        <div className="pt-3 border-t border-text/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-purple md:h-10 md:w-10">
              <Image src={review.user.avatar} alt={review.user.username} fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0">
              <p className="font-roboto text-xs text-text-muted md:text-sm truncate">
                reviewed by <span className="font-semibold text-white">{review.user.username}</span>
              </p>
              <StarRow rating={review.rating} />
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 font-roboto text-xs text-text-muted whitespace-nowrap shrink-0">
            <Heart size={12} />
            {review.likeCount} liked
          </span>
        </div>
      </div>

      {/* Poster — right side always */}
      <div className="relative shrink-0 w-28 self-stretch sm:w-36 md:w-44">
        <Image src={posterUrl(review.movie.posterPath)} alt={review.movie.title} fill sizes="176px" className="object-cover object-top" />
      </div>
    </article>
  )
}

export default function CommunityReview({ reviews }: CommunityReviewProps) {
  const swiperRef = useRef<SwiperClass | null>(null)
  const [active, setActive] = useState(0)

  if (reviews.length === 0) return null

  return (
    <section className="w-full">
      <h2 className="mb-4 font-outfit text-lg font-bold text-text lg:text-xl">
        Community Recommendation
      </h2>

      <Swiper slidesPerView={1} spaceBetween={12}
        breakpoints={{ 1024: { slidesPerView: 2 } }}
        onSwiper={(s) => { swiperRef.current = s }}
        onSlideChange={(s) => setActive(s.activeIndex)}>
        {reviews.map((review, i) => (
          <SwiperSlide key={`${review.user.username}-${i}`}>
            <ReviewCard review={review} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation: arrow — dots — arrow */}
      <div className="mt-5 flex items-center justify-center gap-2">
        <button type="button" onClick={() => swiperRef.current?.slidePrev()} disabled={active === 0}
          aria-label="Previous review"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-text/15 bg-bg-dark text-text transition-opacity disabled:opacity-30 hover:bg-surface">
          <ChevronLeft size={16} />
        </button>

        {reviews.map((_, i) => (
          <button key={i} type="button" onClick={() => swiperRef.current?.slideTo(i)} aria-label={`Review ${i + 1}`}
            className={`rounded-full transition-all duration-200 ${i === active ? 'w-8 h-2.5 bg-[#b8a6f2]' : 'w-2.5 h-2.5 bg-[#b8a6f2]/35'}`} />
        ))}

        <button type="button" onClick={() => swiperRef.current?.slideNext()} disabled={active === reviews.length - 1}
          aria-label="Next review"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-text/15 bg-bg-dark text-text transition-opacity disabled:opacity-30 hover:bg-surface">
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  )
}

export const COMMUNITY_REVIEW_DUMMY: CommunityReviewItem[] = [
  {
    content: 'A masterpiece of tension and character. Every frame feels deliberate, and the score stays with you long after the credits. I have rewatched it twice this month and still notice new details in the background performances.',
    rating: 5,
    user: { username: 'cinephile_omar', avatar: 'https://i.pravatar.cc/150?u=omar' },
    movie: { title: 'The Godfather', posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
    likeCount: 128,
  },
  {
    content: 'Visually stunning and emotionally devastating in the best way. The third act lost me slightly, but the performances carried it home. Would recommend to anyone who loves slow-burn sci-fi with heart.',
    rating: 4,
    user: { username: 'filmlover_j', avatar: 'https://i.pravatar.cc/150?u=jane' },
    movie: { title: 'Interstellar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
    likeCount: 84,
  },
  {
    content: 'Perfect comfort watch with surprising depth. The humor lands every time, and the friendship at the core feels genuine rather than written for plot convenience.',
    rating: 5,
    user: { username: 'popcorn_sam', avatar: 'https://i.pravatar.cc/150?u=sam' },
    movie: { title: 'Spirited Away', posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg' },
    likeCount: 56,
  },
]
