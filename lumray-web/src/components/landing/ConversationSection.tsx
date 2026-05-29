'use client'
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, type ReactNode } from "react"

interface Slide {
    heading: ReactNode
    body: string
    cta: string
    href: string
    bg: string
    demo: string
    demoW: number
    demoH: number
}

const slides: Slide[] = [
    {
        heading: <>Your cinematic <span className="text-purple-light">diary</span></>,
        body: "Rate what you watch, log your journey, and build a library that's uniquely yours.",
        cta: "Check new ratings",
        href: "/ratings",
        bg: "/images/movie-list.png",
        demo: "/images/rating demo.svg",
        demoW: 340,
        demoH: 300,
    },
    {
        heading: <>Leave your <span className="text-purple-light">mark</span></>,
        body: "Your reviews help others find their next obsession. Join the global archive of film lovers by sharing your unique take on this journey.",
        cta: "Check Review",
        href: "/reviews",
        bg: "/images/review-list.png",
        demo: "/images/review demo.svg",
        demoW: 500,
        demoH: 400,
    },
    {
        heading: <>Join the <span className="text-purple-light">collective</span></>,
        body: "Your perspective completes the narrative. Share your unique takes, participate in deep-dives, and build the ultimate archive of cinematic thought.",
        cta: "Explore Community",
        href: "/community",
        bg: "/images/post demo back.png",
        demo: "/images/post demo publish.svg",
        demoW: 500,
        demoH: 300,
    },
]

export default function ConversationSection() {
    const [current, setCurrent] = useState(0)

    return (
        <section className="py-6 px-6 md:px-12 xl:px-60">
            <h2 className="font-outfit text-[36px] sm:text-[52px] md:text-[72px] font-semibold text-text leading-[0.85]">
                Be <span className="text-purple-light">part</span> of the <br /> conversation
            </h2>

            <div className="relative mt-8 md:mt-12">
                {/* slides track */}
                <div className="overflow-hidden rounded-xl">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${current * 100}%)` }}
                    >
                        {slides.map((slide, i) => (
                            <div key={i} className="w-full shrink-0 flex flex-col md:flex-row gap-4 bg-surface">

                                {/* left — text */}
                                <div className="w-full md:w-[45%] shrink-0 flex flex-col">
                                    <div className="flex flex-col gap-4 md:gap-8 pt-8 px-6 lg:py-30 md:pt-[95px] md:pl-[48px] md:pr-8">
                                        <h3 className="font-outfit font-semibold text-[28px] md:text-[62px] text-white leading-tight">
                                            {slide.heading}
                                        </h3>
                                        <p className="text-white text-sm md:text-[20px] leading-relaxed md:max-w-[420px]">
                                            {slide.body}
                                        </p>
                                        <Link
                                            href={slide.href}
                                            className="bg-white w-fit text-purple font-medium text-sm md:text-base px-6 md:px-8 py-2 md:py-2.5 rounded-full hover:bg-text transition-colors"
                                        >
                                            {slide.cta}
                                        </Link>
                                    </div>
                                </div>

                                {/* right — image (scales to fill this column) */}
                                <div className="flex-1 flex p-6 md:p-0">
                                    <div className="relative w-full aspect-square md:aspect-auto rounded-xl md:rounded-none overflow-hidden">
                                        {/* bg fills the wrapper at any size */}
                                        <Image
                                            src={slide.bg}
                                            alt=""
                                            fill
                                            className="object-cover object-left"
                                        />
                                        <div className="absolute inset-0 bg-[#2B2C36]/60" />
                                        {/* demo centered, capped so it never overflows */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Image
                                                src={slide.demo}
                                                alt=""
                                                width={slide.demoW}
                                                height={slide.demoH}
                                                className="w-auto h-auto max-w-[75%] max-h-[78%]"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* arrows */}
                <div className="flex items-center gap-3 mt-6">
                    <button
                        onClick={() => setCurrent(i => Math.max(0, i - 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-text/15 text-text hover:bg-text/10 transition-colors disabled:opacity-30"
                        disabled={current === 0}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrent(i => Math.min(slides.length - 1, i + 1))}
                        className="w-9 h-9 flex items-center justify-center rounded-full border border-text/15 text-text hover:bg-text/10 transition-colors disabled:opacity-30"
                        disabled={current === slides.length - 1}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    )
}
