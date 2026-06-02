'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import HeroSection from '@/components/landing/HeroSection'
import GenreSection from '@/components/landing/GenreSection'
import ConversationSection from '@/components/landing/ConversationSection'

export default function LandingPage() {
    const user = useAuthStore(s => s.user)
    const router = useRouter()

    useEffect(() => {
        if (user) router.replace('/home')
    }, [user, router])

    if (user) return null

    return (
        <main>
            <HeroSection />
            <GenreSection />
            <ConversationSection />
        </main>
    )
}
