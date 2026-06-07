'use client'
import { useEffect, useState } from "react"
import Image from "next/image"
import api from "@/services/api"
import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCoverflow, Autoplay } from "swiper/modules"
import 'swiper/css'
import 'swiper/css/effect-coverflow'

interface Movie {
    id: number
    title: string
    poster_path: string
}

export default function HeroSection() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/movies/top-rated')
            .then((res) => setMovies(res.data.data.slice(0, 20)))
            .finally(() => setLoading(false))
    }, [])

    const swiperProps = {
        modules: [EffectCoverflow, Autoplay],
        effect: 'coverflow' as const,
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        slidesPerView: 'auto' as const,
        speed: 700,
        coverflowEffect: { rotate: 0, stretch: 0, depth: 150, modifier: 3.5 },
        className: "w-full mt-8 md:mt-12",
    }

    return (
        <section className="text-center px-6 md:px-[92px] mb-12 md:mb-18.5">
            <h1 className="font-outfit text-[40px] sm:text-[56px] md:text-[72px] font-semibold text-text">
                Discover your next{' '}
                <span className="text-purple-light">obsession</span>
            </h1>
            <p className="text-white text-[14px] sm:text-[16px] md:text-[18px]">
                From hidden gems to all time classics, explore films that resonate with you.
            </p>

            <Swiper
                {...swiperProps}
                autoplay={{ delay: 1000, disableOnInteraction: false }}
            >
                {(loading ? Array(8).fill(null) : movies).map((movie, index) => (
                    <SwiperSlide key={index} style={{ width: 'clamp(160px, 30vw, 360px)' }}>
                        <div className="relative w-full h-[clamp(240px,45vw,520px)] rounded-xl overflow-hidden bg-surface">
                            {loading ? (
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
                            ) : (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    )
}
