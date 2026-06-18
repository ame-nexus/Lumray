'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper'
import 'swiper/css'
import FollowButton from '@/components/ui/FollowButton'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'

export interface CommunityReviewItem {
  id: string
  content: string
  rating: number
  isLiked: boolean
  user: { id: string; username: string; avatar: string }
  movie: { tmdbId: number; title: string; posterPath: string }
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
        <Star key={i} size={14} className={i < rating ? 'fill-purple-light text-purple-light' : 'text-text-muted'} />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: CommunityReviewItem }) {
  const router  = useRouter()
  const user    = useAuthStore(s => s.user)
  const [liked,     setLiked]     = useState(review.isLiked)
  const [likeCount, setLikeCount] = useState(review.likeCount)

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/login'); return }
    const next = !liked
    setLiked(next)
    setLikeCount(c => c + (next ? 1 : -1))
    try {
      if (next) await api.post(`/api/reviews/${review.id}/like`)
      else       await api.delete(`/api/reviews/${review.id}/like`)
    } catch {
      setLiked(!next)
      setLikeCount(c => c + (next ? -1 : 1))
    }
  }

  return (
    <article className="flex overflow-hidden rounded-xl bg-surface h-56 md:h-64">
      {/* Text column — clickable area */}
      <Link href={`/reviews/${review.id}`} className="flex flex-1 flex-col justify-between p-4 md:p-5 overflow-hidden hover:bg-white/2.5 transition-colors">
        <div className="overflow-hidden">
          <p className="line-clamp-3 font-roboto text-sm leading-relaxed text-text md:line-clamp-5 md:text-base">
            {review.content}
          </p>
          <span className="mt-1 inline-block font-roboto text-xs font-semibold text-purple-light md:text-sm md:mt-2">
            ... Read Entire Review
          </span>
        </div>

        <div className="pt-3 border-t border-text/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-purple md:h-10 md:w-10">
              <Image src={review.user.avatar} alt={review.user.username} fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-roboto text-xs text-text-muted md:text-sm truncate">
                  reviewed by <span className="font-semibold text-white">{review.user.username}</span>
                </p>
                <span onClick={e => e.preventDefault()}>
                  <FollowButton userId={review.user.id} size="xs" />
                </span>
              </div>
              <StarRow rating={review.rating} />
            </div>
          </div>

          {/* Like button */}
          <button
            type="button"
            onClick={toggleLike}
            className={`hidden sm:inline-flex items-center gap-1 font-roboto text-xs whitespace-nowrap shrink-0 transition-colors ${
              liked ? 'text-purple-light' : 'text-text-muted hover:text-text'
            }`}
          >
            <Heart size={12} className={liked ? 'fill-purple-light' : ''} />
            {likeCount} liked
          </button>
        </div>
      </Link>

      {/* Poster — right side */}
      <Link href={`/films/${review.movie.tmdbId}`} className="relative shrink-0 w-28 self-stretch sm:w-36 md:w-44 hover:opacity-90 transition-opacity" onClick={e => e.stopPropagation()}>
        <Image src={posterUrl(review.movie.posterPath)} alt={review.movie.title} fill sizes="176px" className="object-cover object-top" />
      </Link>
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

      {/* Navigation */}
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
    id: 'dummy-1',
    isLiked: false,
    content: 'A masterpiece of tension and character. Every frame feels deliberate, and the score stays with you long after the credits. I have rewatched it twice this month and still notice new details in the background performances.',
    rating: 5,
    user: { id: 'dummy-1', username: 'cinephile_omar', avatar: 'https://i.pravatar.cc/150?u=omar' },
    movie: { tmdbId: 238, title: 'The Godfather', posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
    likeCount: 128,
  },
  {
    id: 'dummy-2',
    isLiked: false,
    content: 'Visually stunning and emotionally devastating in the best way. The third act lost me slightly, but the performances carried it home. Would recommend to anyone who loves slow-burn sci-fi with heart.',
    rating: 4,
    user: { id: 'dummy-2', username: 'filmlover_j', avatar: 'https://i.pravatar.cc/150?u=jane' },
    movie: { tmdbId: 157336, title: 'Interstellar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
    likeCount: 84,
  },
  {
    id: 'dummy-3',
    isLiked: false,
    content: 'Perfect comfort watch with surprising depth. The humor lands every time, and the friendship at the core feels genuine rather than written for plot convenience.',
    rating: 5,
    user: { id: 'dummy-3', username: 'popcorn_sam', avatar: 'https://i.pravatar.cc/150?u=sam' },
    movie: { tmdbId: 129, title: 'Spirited Away', posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg' },
    likeCount: 56,
  },
]
