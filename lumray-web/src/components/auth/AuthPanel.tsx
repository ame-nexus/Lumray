'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

// shared purple left panel — used on all auth pages
export default function AuthPanel({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex">
            <div className="w-full flex">

                {/* purple left — hidden on mobile, all pages share this */}
                <div className="hidden md:flex w-[40%] shrink-0 bg-[#583DB3] p-12 flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center gap-2 relative z-10">
                        <Image src="/images/lumray-icon.svg" alt="Lumray" width={60} height={60} />
                        <span className="font-outfit font-semibold text-white text-3xl">lumray</span>
                    </div>

                    {/* two circle patterns for depth */}
                    <Image src="/images/circle pattern2.svg" alt="" width={340} height={340}
                        className="absolute -bottom-16 -right-16 opacity-80" />
                    <Image src="/images/circle pattern2.svg" alt="" width={200} height={200}
                        className="absolute -top-10 -left-10 opacity-50" />

                    <div className="relative z-10">
                        <h1 className="font-outfit font-bold text-[70px] md:text-[50px] text-[#EDE9FC] leading-tight mb-16">
                            A diary for everything you watch.
                        </h1>
                        <p className="text-white/90 text-lg md:text-sm leading-relaxed">
                            Log films. Rate them. Join a community that takes cinema seriously — without taking itself too seriously.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-1 text-white/80 text-sm border border-white/30 rounded-full px-4 py-2 w-fit hover:bg-white/10 transition-colors">
                            <ChevronLeft size={16} />
                            Back
                        </Link>
                    </div>
                </div>

                {/* right side — each page injects its own content here */}
                <div className="flex-1 bg-[#1a1b21] p-8 md:px-16 xl:px-40 flex flex-col justify-center">
                    {/* back button — mobile only */}
                    <Link href="/" className="md:hidden flex items-center gap-1 text-text-muted text-sm mb-8 hover:text-white transition-colors w-fit">
                        <ChevronLeft size={16} />
                        Back
                    </Link>
                    {children}
                </div>

            </div>
        </div>
    )
}
