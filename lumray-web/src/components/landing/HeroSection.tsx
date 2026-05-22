// 'use client'
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import api from "@/services/api";

// interface Movie {
//     id: number
//     title: string
//     poster_path: string
// }

// export default function HeroSection() {
//     const [movies, setMovies] = useState<Movie[]>([])

//     useEffect(() => {
//         api.get('/api/movies/top-rated')
//             .then((res) => {
//                 setMovies(res.data.data.slice(0, 8))
//             })
//     }, [])
//     return (
//         <section className="text-center px-16 overflow-hidden">
//             <h1 className="font-outfit text-[88px] font-semibold text-text">
//                 Discover your next{' '}
//                 <span className="text-purple-light">obsession</span>
//             </h1>
//             <p className="text-white text-[20px] ">
//                 From hidden gems to all time classics, explore films that resonate with you.
//             </p>
//             <div className="w-full overflow-hidden" style={{perspective: '1000px'}}>
//                 <div className="flex gap-4 animate-scroll w-max">
//                     {[...movies, ...movies].map((movie, index) => {
//                         return (
//                             <div key={index}
//                                 className="relative rounded-2xl overflow-hidden shrink-0 w-44 h-64">
//                                 <Image
//                                     src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
//                     alt={movie.title}
//                     fill
//                     className="object-cover"
//                                 />
//                 </div>
//                 )
//                     })}
//             </div>
//         </div>
//         </section >
//     )
// }

'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import 'swiper/css'
import 'swiper/css/effect-coverflow'

interface Movie {
    id: number
    title: string
    poster_path: string
}

export default function HeroSection() {
    const [movies, setMovies] = useState<Movie[]>([])

    useEffect(() => {
        api.get('/api/movies/top-rated')
            .then((res) => {
                setMovies(res.data.data.slice(0, 20))
            })
    }, [])

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
                modules={[EffectCoverflow, Autoplay]}
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                slidesPerView="auto"
                speed={700}
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 150,
                    modifier: 3.5,
                }}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                className="w-full mt-8 md:mt-12"
            >
                {movies.map((movie, index) => (
                    <SwiperSlide
                        key={index}
                        style={{ width: 'clamp(160px, 30vw, 360px)' }}
                    >
                        <div className="relative w-full h-[clamp(240px,45vw,520px)] rounded-xl overflow-hidden">
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    )
}