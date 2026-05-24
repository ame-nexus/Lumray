'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import api from '@/services/api'
import AuthPanel from './AuthPanel'

const resetSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirm: z.string()
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

export default function ResetPassword() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') ?? ''

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        setError(null)

        const parsed = resetSchema.safeParse({ password, confirm })
        if (!parsed.success) {
            setError(parsed.error.issues[0].message)
            return
        }

        setLoading(true)
        try {
            await api.post('/api/auth/reset-password', { token, password })
            router.push('/login?reset=success')
        } catch (err) {
            const e = err as AxiosError<{ error: string }>
            setError(e.response?.data?.error ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <AuthPanel>
                <p className="text-red-400">Invalid reset link. Please request a new one.</p>
            </AuthPanel>
        )
    }

    return (
        <AuthPanel>
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="font-outfit font-bold text-[28px] text-white">Reset password</h2>
                    <p className="text-text-muted text-sm mt-1">Enter your new password below</p>
                </div>

                {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-text text-sm">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} required
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-bg border border-text/10 text-white rounded-lg px-4 py-3 pr-11 text-sm placeholder:text-text-muted focus:outline-none focus:border-purple"
                            />
                            <button type="button" onClick={() => setShowPassword(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {password &&
                            <ul className="text-xs text-text-muted flex flex-col gap-1 mt-1">
                                <li className={password.length >= 8 ? 'text-green-400' : ''}>• At least 8 characters</li>
                                <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>• One uppercase letter</li>
                                <li className={/[0-9]/.test(password) ? 'text-green-400' : ''}>• One number</li>
                                <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-400' : ''}>• One special character</li>
                            </ul>
                        }
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-text text-sm">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirm} required
                                onChange={e => setConfirm(e.target.value)}
                                className="w-full bg-bg border border-text/10 text-white rounded-lg px-4 py-3 pr-11 text-sm placeholder:text-text-muted focus:outline-none focus:border-purple"
                            />
                            <button type="button" onClick={() => setShowConfirm(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors">
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="bg-purple text-white rounded-lg py-3 font-medium hover:bg-[#5f3ecf] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </AuthPanel>
    )
}
