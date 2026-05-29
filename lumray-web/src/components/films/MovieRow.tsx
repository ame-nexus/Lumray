'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

export interface MovieRowMovie {
  id: number
  title: string
  posterPath: string
}

export interface MovieRowProps {
  title: string
  movies: MovieRowMovie[]
  moreHref?: string
}

const VISIBLE_DESKTOP = 5

function posterUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w300${path}`
}

export default function MovieRow({
  title,
  movies,
  moreHref = '#',
}: MovieRowProps) {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(movies.length / VISIBLE_DESKTOP))
  const canPrev = page > 0
  const canNext = page < pageCount - 1

  const goPrev = () => setPage((p) => Math.max(0, p - 1))
  const goNext = () => setPage((p) => Math.min(pageCount - 1, p + 1))

  const desktopMovies = movies.slice(
    page * VISIBLE_DESKTOP,
    page * VISIBLE_DESKTOP + VISIBLE_DESKTOP
  )

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-xl font-semibold text-text md:text-2xl">
          {title}
        </h2>
        <Link
          href={moreHref}
          className="shrink-0 font-roboto text-sm text-purple-light hover:text-text transition-colors"
        >
          more
        </Link>
      </div>

      {/* Desktop: 5 posters + arrows */}
      <div className="relative hidden lg:block">
        <div className="grid grid-cols-5 gap-4">
          {desktopMovies.map((movie) => (
            <Link key={movie.id} href={`/films/${movie.id}`} className="group block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                <Image
                  src={posterUrl(movie.posterPath)}
                  alt={movie.title}
                  fill
                  sizes="20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
          {desktopMovies.length < VISIBLE_DESKTOP &&
            Array.from({ length: VISIBLE_DESKTOP - desktopMovies.length }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-[2/3]" aria-hidden />
            ))}
        </div>

        {pageCount > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous movies"
              className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-text/15 bg-bg-dark text-text shadow-lg transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next movies"
              className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-text/15 bg-bg-dark text-text shadow-lg transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {pageCount > 1 && (
          <div className="mt-5 flex justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page ? 'w-6 bg-purple-light' : 'w-2 bg-text-muted/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tablet & mobile: Swiper (no arrow buttons) */}
      <div className="lg:hidden movie-row-swiper">
        <Swiper
          modules={[Pagination]}
          slidesPerView={2.15}
          spaceBetween={12}
          breakpoints={{
            640: { slidesPerView: 2.75 },
            768: { slidesPerView: 3.5 },
          }}
          pagination={{ clickable: true }}
          className="!pb-10"
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <Link href={`/films/${movie.id}`} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                  <Image
                    src={posterUrl(movie.posterPath)}
                    alt={movie.title}
                    fill
                    sizes="45vw"
                    className="object-cover"
                  />
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .movie-row-swiper .swiper-pagination-bullet {
          background: #7a7882;
          opacity: 1;
        }
        .movie-row-swiper .swiper-pagination-bullet-active {
          background: #b9a4fc;
          width: 1.5rem;
          border-radius: 9999px;
        }
      `}</style>
    </section>
  )
}

export const MOVIE_ROW_DUMMY: MovieRowMovie[] = [
  { id: 550, title: 'Fight Club', posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
  { id: 157336, title: 'Interstellar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
  { id: 27205, title: 'Inception', posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },
  { id: 155, title: 'The Dark Knight', posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
  { id: 680, title: 'Pulp Fiction', posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg' },
  { id: 13, title: 'Forrest Gump', posterPath: '/arw2vcBveWOVZ6oa6TEq6NAsWzf.jpg' },
  { id: 238, title: 'The Godfather', posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { id: 424, title: 'Schindler\'s List', posterPath: '/sF1U4EUQS8YHUYjNl3pMGWMQumv.jpg' },
  { id: 389, title: '12 Angry Men', posterPath: '/ow3wq89wM8qd5X7hWKxiRfsFf9J.jpg' },
  { id: 129, title: 'Spirited Away', posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg' },
]
