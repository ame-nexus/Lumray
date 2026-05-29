'use client'

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import api from "@/services/api"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import type { Swiper as SwiperClass } from "swiper"
import 'swiper/css'
import 'swiper/css/grid'

interface Movie {
    id: number
    title: string
    poster_path: string
}

const genres = [
    { id: 28, name: 'Action' },
    { id: 53, name: 'Thriller' },
    { id: 35, name: 'Comedy' },
    { id: 16, name: 'Animation' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' },
    { id: 878, name: 'Sci-Fi' },
    { id: 80, name: 'Crime' },
    { id: 14, name: 'Fantasy' },
    { id: 10749, name: 'Romance' },
    { id: 9648, name: 'Mystery' },
]

export default function GenreSection() {
    const [selectedGenre, setSelectedGenre] = useState(genres[0])
    const [moviesByGenre, setMoviesByGenre] = useState<Record<number, Movie[]>>({})
    const genreSwiperRef = useRef<SwiperClass | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all(
            genres.map(g =>
                api.get(`/api/movies/by-genre/${g.id}`)
                    .then(res => ({ id: g.id, movies: res.data.data.slice(0, 30) }))
            )
        ).then(results => {
            const cache: Record<number, Movie[]> = {}
            results.forEach(r => { cache[r.id] = r.movies })
            setMoviesByGenre(cache)
        }).finally(() => setLoading(false))
    }, [])


    return (
        <section className="bg-surface px-6 md:px-12 xl:px-60 py-10 md:py-16 overflow-hidden">
            {/*header*/}
            <div className="flex flex-col items-center text-center gap-4 mb-10 md:mb-18 px-6 md:px-12">
                <h2 className="w-full font-outfit text-[30px] sm:text-[52px] md:text-[72px] font-semibold text-text">
                    <span className="text-purple-light">Explore</span> by mood, era, or genre
                </h2>
                <p className="w-full max-w-[640px] text-white text-[14px] sm:text-[16px] md:text-[18px]">
                    Whether you need a visceral thrill or a quiet moment of
                    reflection, we&apos;ve mapped out the cinematic landscape for you.
                </p>
            </div>
            {/*swiper films*/}
            <Swiper
                key={loading ? 'skeleton' : selectedGenre.id}
                modules={[Autoplay]}
                slidesPerView={3}
                breakpoints={{
                    480: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                }}
                speed={700}
                {...(!loading && { autoplay: { delay: 1000, disableOnInteraction: false, pauseOnMouseEnter: true } })}
                spaceBetween={12}
                loop
                className="px-6 md:px-12 xl:px-60 mb-8 md:mb-12"
            >
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <SwiperSlide key={i}>
                            <div className="relative aspect-2/3 rounded-xl bg-surface overflow-hidden">
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
                            </div>
                        </SwiperSlide>
                    ))
                    : (moviesByGenre[selectedGenre.id] ?? []).map((movie) => (
                        <SwiperSlide key={movie.id}>
                            <div className="relative aspect-2/3 rounded-xl overflow-hidden">
                                {movie.poster_path && (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                        alt={movie.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </SwiperSlide>
                    ))
                }
            </Swiper>
            {/*swiper genre*/}
            <Swiper
                modules={[Autoplay]}
                centeredSlides
                slidesPerView="auto"
                speed={500}
                autoplay={{ delay: 10000, disableOnInteraction: false }}
                rewind
                onSlideChange={(swiper) => setSelectedGenre(genres[swiper.realIndex])}
                onSwiper={(swiper) => { genreSwiperRef.current = swiper }}
            >
                {genres.map((genre) => (
                    <SwiperSlide
                        key={genre.id}
                        style={{ width: 'auto' }}
                        onClick={() => genreSwiperRef.current?.slideToLoop(genres.indexOf(genre))}
                    >
                        {({ isActive }) => (
                            <span className={`px-4 md:px-8 font-outfit font-medium transition-all duration-300 cursor-pointer text-sm md:text-base ${isActive ? 'text-white' : 'text-text/20'
                                }`}>
                                {genre.name}
                            </span>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    )
}
