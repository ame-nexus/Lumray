'use client'

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"
import { FaGoogle } from "react-icons/fa"
import { z } from "zod"
import type { AxiosError } from "axios"
import api from "@/services/api"
import { useAuthStore } from "@/store/auth.store"
import AuthPanel from "./AuthPanel"

const passwordRules = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

const signupSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
    email: z.email('Invalid email address'),
    password: passwordRules,
    confirm: z.string()
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})

// ─── prop lets each page (/login, /signup) control the starting tab ───────────
interface SignPageProps {
    defaultTab: 'login' | 'signup'
}

function OAuthButtons() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-text/10" />
                <span className="text-text-muted text-xs">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-text/10" />
            </div>
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
                className="flex items-center justify-center gap-2 border border-text/15 text-white rounded-lg py-2.5 text-sm hover:bg-text/5 transition-colors">
                <FaGoogle size={16} />
                Continue with Google
            </a>

        </div>
    )
}

function SignupForm() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        setError(null)

        const parsed = signupSchema.safeParse({ username, email, password, confirm })
        if (!parsed.success) {
            setError(parsed.error.issues[0].message)
            return
        }

        setLoading(true)
        try {
            await api.post('/api/auth/register', { username, email, password })
            // redirect to verify screen, pass email so we know who to verify
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)

        } catch (err) {
            const e = err as AxiosError<{ error: string }>
            setError(e.response?.data?.error ?? 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h2 className="font-outfit font-bold text-[28px] text-white">Join Lumray</h2>

            {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Username</label>
                <input
                    type="text" placeholder="username" value={username} required
                    onChange={e => setUsername(e.target.value)}
                    className="bg-bg border border-text/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-purple"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Email</label>
                <input
                    type="email" placeholder="name@example.com" value={email} required
                    onChange={e => setEmail(e.target.value)}
                    className="bg-bg border border-text/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-purple"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[#ede9fc] text-sm">Password</label>
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
                <label className="text-[#ede9fc] text-sm">Confirm Password</label>
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

            <button
                type="submit" disabled={loading}
                className="bg-purple text-white rounded-lg py-3 font-medium hover:bg-[#5f3ecf] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <OAuthButtons />
        </form>
    )
}

function LoginForm() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        setError(null)

        const parsed = loginSchema.safeParse({ email, password })
        if (!parsed.success) {
            setError(parsed.error.issues[0].message)
            return
        }

        setLoading(true)
        try {
            const res = await api.post('/api/auth/login', { email, password, rememberMe })
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
                <h2 className="font-outfit font-bold text-[28px] text-white">Welcome back</h2>
                <p className="text-text-muted text-sm mt-1">Pick up where you left off</p>
            </div>

            {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-1.5">
                <label className="text-text text-sm">Email</label>
                <input
                    type="email" placeholder="name@example.com" value={email} required
                    onChange={e => setEmail(e.target.value)}
                    className="bg-bg border border-text/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:outline-none focus:border-purple"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-text text-sm">Password</label>
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
            </div>

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-text text-sm cursor-pointer">
                    <input
                        type="checkbox" checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="accent-purple"
                    />
                    Remember me
                </label>
                <Link href="/forgot-password" className="text-[#b9a4fc] text-sm hover:underline">
                    Forgot password?
                </Link>
            </div>

            <button
                type="submit" disabled={loading}
                className="bg-purple text-white rounded-lg py-3 font-medium hover:bg-[#5f3ecf] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Logging in...' : 'Log In'}
            </button>

            <OAuthButtons />
        </form>
    )
}

export default function SignPage({ defaultTab }: SignPageProps) {
    const router = useRouter()

    // tab state is driven by the URL — switching tabs navigates to /login or /signup
    // so the URL always matches what's visible on screen
    const [tab, setTab] = useState<'login' | 'signup'>(defaultTab)

    const switchTab = (next: 'login' | 'signup') => {
        setTab(next)
        router.push(`/${next}`) // ← URL changes when tab changes
    }

    return (
        <AuthPanel>
            <div className="flex gap-6 border-b border-text/10 mb-8 ">
                <button type="button" onClick={() => switchTab('login')}
                    className={`pb-3 text-lg font-medium transition-colors ${tab === 'login' ? 'text-white border-b-2 border-purple' : 'text-text-muted'}`}>
                    Log In
                </button>
                <button type="button" onClick={() => switchTab('signup')}
                    className={`pb-3 text-lg font-medium transition-colors ${tab === 'signup' ? 'text-white border-b-2 border-purple' : 'text-text-muted'}`}>
                    Sign Up
                </button>
            </div>

            {tab === 'login' ? <LoginForm /> : <SignupForm />}

        </AuthPanel>
    )

}
