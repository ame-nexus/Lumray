'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import api from '@/services/api'
import { Suspense } from 'react'

function CallbackHandler() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            router.push('/login')
            return
        }

        api.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            useAuthStore.getState().setCredentials(res.data.data, token)
            router.push('/')
        }).catch(() => {
            router.push('/login')
        })
    }, [])

    return (
        <div className="min-h-screen bg-[#1a1b21] flex items-center justify-center">
            <p className="text-white text-sm">Signing you in...</p>
        </div>
    )
}

export default function CallbackPage() {
    return (
        <Suspense>
            <CallbackHandler />
        </Suspense>
    )
}
