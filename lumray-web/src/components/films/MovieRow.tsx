'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import MoviePoster from './MoviePoster'

export interface MovieRowMovie {
  id: number
  dbId?: string
  title: string
  posterPath: string
  year?: string | number
  rating?: number
  ratingCount?: number
}

export interface MovieRowProps {
  title: string
  movies: MovieRowMovie[]
  moreHref?: string
}

const VISIBLE = 6

export default function MovieRow({ title, movies, moreHref }: MovieRowProps) {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(movies.length / VISIBLE))
  const canPrev = page > 0
  const canNext = page < pageCount - 1

  const visible = movies.slice(page * VISIBLE, page * VISIBLE + VISIBLE)

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-lg font-bold text-text lg:text-xl">{title}</h2>
        {moreHref && (
          <Link
            href={moreHref}
            className="shrink-0 font-roboto text-sm text-white underline underline-offset-2 transition-colors hover:text-text-muted"
          >
            more
          </Link>
        )}
      </div>

      {/* Desktop: 6 posters */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-6 gap-8">
          {visible.map((movie) => (
            <MoviePoster
              key={movie.id}
              id={movie.id}
              dbId={movie.dbId}
              title={movie.title}
              posterPath={movie.posterPath}
              year={movie.year}
              rating={movie.rating}
              ratingCount={movie.ratingCount}
              sizes="16vw"
            />
          ))}
          {visible.length < VISIBLE &&
            Array.from({ length: VISIBLE - visible.length }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-2/3" aria-hidden />
            ))}
        </div>

        {pageCount > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button type="button" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={!canPrev}
              aria-label="Previous"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-text/15 bg-bg-dark text-text transition-opacity disabled:opacity-30 hover:bg-surface">
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: pageCount }).map((_, i) => (
              <button key={i} type="button" onClick={() => setPage(i)} aria-label={`Page ${i + 1}`}
                className={`rounded-full transition-all duration-200 ${
                  i === page ? 'w-8 h-2.5 bg-[#b8a6f2]' : 'w-2.5 h-2.5 bg-[#b8a6f2]/35'
                }`} />
            ))}

            <button type="button" onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={!canNext}
              aria-label="Next"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-text/15 bg-bg-dark text-text transition-opacity disabled:opacity-30 hover:bg-surface">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile / tablet: Swiper */}
      <div className="lg:hidden">
        <Swiper slidesPerView={2.15} spaceBetween={10}
          breakpoints={{ 640: { slidesPerView: 2.75 }, 768: { slidesPerView: 3.5 } }}>
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <MoviePoster
                id={movie.id}
                dbId={movie.dbId}
                title={movie.title}
                posterPath={movie.posterPath}
                year={movie.year}
                rating={movie.rating}
                ratingCount={movie.ratingCount}
                sizes="45vw"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

export const MOVIE_ROW_DUMMY: MovieRowMovie[] = [
  { id: 550,    title: 'Fight Club',       posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', year: 1999, rating: 4.4, ratingCount: 28100 },
  { id: 157336, title: 'Interstellar',     posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', year: 2014, rating: 4.6, ratingCount: 21300 },
  { id: 27205,  title: 'Inception',        posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', year: 2010, rating: 4.5, ratingCount: 26700 },
  { id: 155,    title: 'The Dark Knight',  posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', year: 2008, rating: 4.7, ratingCount: 31200 },
  { id: 680,    title: 'Pulp Fiction',     posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', year: 1994, rating: 4.6, ratingCount: 24800 },
  { id: 13,     title: 'Forrest Gump',     posterPath: '/arw2vcBveWOVZ6oa6TEq6NAsWzf.jpg', year: 1994, rating: 4.3, ratingCount: 19900 },
  { id: 238,    title: 'The Godfather',    posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', year: 1972, rating: 4.8, ratingCount: 22400 },
  { id: 424,    title: "Schindler's List", posterPath: '/sF1U4EUQS8YHUYjNl3pMGWMQumv.jpg', year: 1993, rating: 4.7, ratingCount: 18600 },
  { id: 389,    title: '12 Angry Men',     posterPath: '/ow3wq89wM8qd5X7hWKxiRfsFf9J.jpg', year: 1957, rating: 4.6, ratingCount: 12300 },
  { id: 129,    title: 'Spirited Away',    posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg', year: 2001, rating: 4.7, ratingCount: 17800 },
  { id: 372058, title: 'Your Name',        posterPath: '/q719jXXEzOoYaps6babgKnONONX.jpg', year: 2016, rating: 4.5, ratingCount: 14200 },
  { id: 19404,  title: 'DDLJ',             posterPath: '/2CAL2433ZeIihfX1Hb2139CX0pW.jpg', year: 1995, rating: 4.2, ratingCount: 8900  },
]
