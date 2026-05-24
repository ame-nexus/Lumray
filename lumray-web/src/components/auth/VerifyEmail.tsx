'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth.store'
import api from '@/services/api'
import AuthPanel from './AuthPanel'

export default function VerifyEmail() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') ?? ''

    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const inputs = useRef<(HTMLInputElement | null)[]>([])
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resent, setResent] = useState(false)

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return
        const next = [...digits]
        next[index] = value
        setDigits(next)
        if (value && index < 5) inputs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const code = digits.join('')
        if (code.length < 6) {
            setError('Enter the full 6-digit code')
            return
        }
        setError(null)
        setLoading(true)
        try {
            const res = await api.post('/api/auth/verify-email', { email, code })
            const { user, token } = res.data.data
            useAuthStore.getState().setCredentials(user, token)
            router.push('/')
        } catch (err) {
            const e = err as AxiosError<{ error: string }>
            setError(e.response?.data?.error ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        setResent(false)
        try {
            await api.post('/api/auth/resend-verification', { email })
            setResent(true)
        } catch (err) {
            const e = err as AxiosError<{ error: string }>
            setError(e.response?.data?.error ?? 'Failed to resend')
        } finally {
            setResending(false)
        }
    }
    return (
        <AuthPanel>
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="font-outfit font-bold text-[28px] text-white">Check your email</h2>
                    <p className="text-text-muted text-sm mt-1">
                        We sent a 6-digit code to <span className="text-white">{email}</span>
                    </p>
                </div>

                {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}
                {resent && <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">Code resent - check your inbox</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div className='flex gap-3 justify-center'>
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={el => { inputs.current[i] = el }}
                                type="text"
                                inputMode='numeric'
                                maxLength={1}
                                value={d}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-white text-xl font-bold bg-bg border border-text/10 rounded-lg focus:outline-none focus:border-purple"
                            />
                        ))}
                    </div>

                    <button type="submit" disabled={loading}
                        className="bg-purple text-white rounded-lg py-3 font-medium hover:bg-purple-deep transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>
                <button onClick={handleResend} disabled={resending}
                    className="text-purple-light text-sm hover:underline disabled:opacity-50 text-center">
                    {resending ? 'Resending...' : "didn't get it? Resend code"}
                </button>
            </div>
        </AuthPanel>
    )
}