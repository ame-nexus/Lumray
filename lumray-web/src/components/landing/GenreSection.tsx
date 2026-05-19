'use client'

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import api from "@/services/api"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import 'swiper/css'
import 'swiper/css/grid'
import Link from "next/link"


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
    const genreSwiperRef = useRef<any>(null)

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
        })
    }, [])

    return (
        <section className="bg-surface py-16 px-40 overflow-hidden ">
            {/*header*/}
            <div className="flex flex-col items-center gap-4 mb-18 px-8">
                <h2 className="font-outfit text-[88px] font-semibold text-text">
                    <span className="text-purple-light">Explore</span> by mood, era, or genre
                </h2>
                <p className="text-white text-[20px]">
                    Whether you need a visceral thrill or a quiet moment of
                    reflection, we've mapped out the cinematic landscape for you.
                </p>
                {/* <Link href="/films" className="bg-white text-purple font-medium text-base mt-1.5 px-10 py-2.5 rounded-full hover:bg-text transition-colors">Genre List</Link> */}
            </div>
            {/*swiper films*/}
            <Swiper
                key={selectedGenre.id}
                modules={[Autoplay]}
                slidesPerView={5}
                speed={700}
                autoplay={{ delay: 800, disableOnInteraction: false }}
                spaceBetween={12}
                loop
                className="px-16 mb-12"
            >
                {(moviesByGenre[selectedGenre.id] ?? []).map((movie) => (
                    <SwiperSlide key={movie.id}>
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
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
                ))}
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
                            <span className={`px-8 font-outfit font-medium transition-all duration-300 cursor-pointer ${isActive ? 'text-white' : 'text-text/20'
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
