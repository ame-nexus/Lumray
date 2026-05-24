'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import api from '@/services/api'
import AuthPanel from '@/components/auth/AuthPanel'

const forgotSchema = z.object({
    email: z.email('Invalid email address')
})

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        setError(null)

        const parsed = forgotSchema.safeParse({ email })
        if (!parsed.success) {
            setError(parsed.error.issues[0].message)
            return
        }

        setLoading(true)
        try {
            await api.post('/api/auth/forgot-password', { email })
            setSent(true)
        } catch (err) {
            const e = err as AxiosError<{ error: string }>
            setError(e.response?.data?.error ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthPanel>
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="font-outfit font-bold text-[28px] text-white">Forgot password?</h2>
                    <p className="text-text-muted text-sm mt-1">Enter your email and we'll send you a reset link</p>
                </div>

                {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

                {sent ? (
                    <div className="flex flex-col gap-4">
                        <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
                            If that email exists, a reset link has been sent. Check your inbox.
                        </p>
                        <Link href="/login" className="text-purple-light text-sm hover:underline text-center">
                            Back to login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-text text-sm">Email</label>
                            <input
                                type="email" placeholder="name@example.com" value={email} required
                                onChange={e => setEmail(e.target.value)}
                                className="bg-bg border border-text/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-purple"
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            className="bg-purple text-white rounded-lg py-3 font-medium hover:bg-[#5f3ecf] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <Link href="/login" className="text-text-muted text-sm hover:text-white transition-colors text-center">
                            Back to login
                        </Link>
                    </form>
                )}
            </div>
        </AuthPanel>
    )
}
