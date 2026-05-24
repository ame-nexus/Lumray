import {create} from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    username: string
    email: string
    name: string | null
    bio: string | null
    avatar: string | null
    coverImage: string | null
    emailVerified: boolean
    points: number
    level: number
}

interface AuthStore {
    user: User | null
    token: string | null
    setCredentials: (user: User, token: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setCredentials: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        { name: 'auth' }
    )
)
