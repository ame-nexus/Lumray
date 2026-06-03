'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, ChevronDown, LogOut, User, Film, BookOpen, Star, List } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

function NavLink({ href, children, mobile = false }: { href: string, children: React.ReactNode, mobile?: boolean }) {
    const pathname = usePathname()
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
    const base = mobile ? 'text-sm' : 'text-base xl:text-lg'
    return (
        <Link href={href} className={`font-medium transition-colors ${base} ${isActive
            ? 'text-purple-light underline underline-offset-4'
            : 'text-text hover:text-purple-light'
        }`}>
            {children}
        </Link>
    )
}

function UserMenu() {
    const [open, setOpen] = useState(false)
    const user = useAuthStore(s => s.user)
    const logout = useAuthStore(s => s.logout)
    const router = useRouter()

    return (
        <div className="relative">
            {/* trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full hover:bg-surface/80 transition-colors"
            >
                {/* avatar — fallback to initials if no image */}
                <div className="w-7 h-7 rounded-full bg-purple flex items-center justify-center overflow-hidden">
                    {user?.avatar
                        ? <Image src={user.avatar} alt={user.username} width={28} height={28} className="object-cover" />
                        : <span className="text-white text-xs font-semibold">{user?.username?.[0]?.toUpperCase()}</span>
                    }
                </div>
                <span className="text-white text-sm font-medium truncate max-w-20 md:max-w-35">{user?.username}</span>
                <ChevronDown size={14} className={`text-text transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* dropdown */}
            {open && (
                <>
                    {/* backdrop — clicking outside closes the menu */}
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-11 z-20 w-52 bg-surface border border-text/10 rounded-xl overflow-hidden shadow-xl">
                        <div className="px-4 py-3 border-b border-text/10">
                            <p className="text-white text-sm font-medium">{user?.username}</p>
                            <p className="text-text-muted text-xs">{user?.email}</p>
                        </div>
                        <div className="py-1">
                            <Link href={`/profile/${user?.username}`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <User size={15} /> Profile
                            </Link>
                            <Link href={`/profile/${user?.username}/films`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <Film size={15} /> Films
                            </Link>
                            <Link href={`/profile/${user?.username}/diary`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <BookOpen size={15} /> Diary
                            </Link>
                            <Link href={`/profile/${user?.username}/reviews`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <Star size={15} /> Reviews
                            </Link>
                            <Link href={`/profile/${user?.username}/lists`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <List size={15} /> Lists
                            </Link>
                        </div>
                        <div className="border-t border-text/10 py-1">
                            <button
                                onClick={() => { logout(); setOpen(false); router.push('/') }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 text-sm hover:bg-red-400/10 transition-colors"
                            >
                                <LogOut size={15} /> Log Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default function Navbar() {
    const user = useAuthStore(s => s.user)

    return (
        <nav className='sticky top-0 z-50 bg-bg-dark'>

            {/* Desktop */}
            <div className='hidden md:flex items-center justify-between px-12 xl:px-60 h-[84px]'>
                <Link href={user ? "/home" : "/"} className="flex items-center gap-2">
                    <Image src="/images/lumray-icon.svg" alt="Lumray" width={42} height={42} />
                    <span className="font-outfit text-2xl font-bold text-white">lumray</span>
                </Link>

                <div className='flex items-center gap-4'>
                    <NavLink href="/home">Home</NavLink>
                    <NavLink href="/films">Films</NavLink>
                    <NavLink href="/community">Community</NavLink>
                    <NavLink href="/lists">Lists</NavLink>
                    <div className="w-px h-5 bg-text/20 mx-1" />
                    {/* search — overlay wired up later */}
                    <button className="text-text hover:text-white transition-colors">
                        <Search size={20} />
                    </button>

                    {user && (
                        /* notifications — wired up later */
                        <button className="relative text-text hover:text-white transition-colors">
                            <Bell size={20} />
                            {/* unread dot — replace with real count later */}
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple rounded-full" />
                        </button>
                    )}

                    {user ? (
                        <UserMenu />
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-text font-medium text-base hover:text-purple-light">Log In</Link>
                            <Link href="/signup" className="bg-purple text-white font-medium text-base px-4 py-2 rounded-full hover:bg-purple-deep transition-colors whitespace-nowrap">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile */}
            <div className='md:hidden'>
                <div className='flex items-center justify-between px-6 h-[60px]'>
                    <Link href={user ? "/home" : "/"} className="flex items-center gap-2">
                        <Image src="/images/lumray-icon.svg" alt="Lumray" width={32} height={32} />
                        <span className="font-outfit text-xl font-bold text-white">lumray</span>
                    </Link>
                    <div className='flex items-center gap-3'>
                        {/* search icon always visible */}
                        <button className="text-text hover:text-white transition-colors">
                            <Search size={18} />
                        </button>
                        {user ? (
                            <>
                                <button className="relative text-text hover:text-white transition-colors">
                                    <Bell size={18} />
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple rounded-full" />
                                </button>
                                <UserMenu />
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-text font-medium text-sm hover:text-purple-light">Log In</Link>
                                <Link href="/signup" className="bg-purple text-white font-medium text-sm px-4 py-2 rounded-full hover:bg-purple-deep transition-colors whitespace-nowrap">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
                <div className='border-t border-text/10 flex items-center justify-center gap-8 h-11 px-6'>
                    <NavLink href="/home" mobile>Home</NavLink>
                    <NavLink href="/films" mobile>Films</NavLink>
                    <NavLink href="/community" mobile>Community</NavLink>
                    <NavLink href="/lists" mobile>Lists</NavLink>
                </div>
            </div>

        </nav>
    )
}
