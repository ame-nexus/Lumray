'use client'

// Conditionally renders Navbar + Footer.
// Auth pages (/login, /signup) get neither — they have their own full-screen layout.
// Every other page gets both automatically.
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

const AUTH_ROUTES = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password', '/auth/callback']

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuth = AUTH_ROUTES.includes(pathname)

    return (
        <>
            {!isAuth && <Navbar />}
            {children}
            {!isAuth && <Footer />}
        </>
    )
}
