'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, ChevronDown, LogOut, User, Film, BookOpen, Star, List, Globe, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useLanguageStore, type Lang } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import SearchModal from '@/components/search/SearchModal'

const LANGS: { code: Lang; label: string; flag: string }[] = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
]

function NavLink({ href, children, mobile = false }: { href: string; children: React.ReactNode; mobile?: boolean }) {
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
    const [open, setOpen]   = useState(false)
    const user              = useAuthStore(s => s.user)
    const logout            = useAuthStore(s => s.logout)
    const lang              = useLanguageStore(s => s.lang)
    const setLang           = useLanguageStore(s => s.setLang)
    const router            = useRouter()
    const t                 = useT(lang)

    return (
        <div className="relative">
            {/* trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full hover:bg-surface/80 transition-colors"
            >
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
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-11 z-20 w-52 bg-surface border border-text/10 rounded-xl overflow-hidden shadow-xl">

                        {/* User info */}
                        <div className="px-4 py-3 border-b border-text/10">
                            <p className="text-white text-sm font-medium">{user?.username}</p>
                            <p className="text-text-muted text-xs">{user?.email}</p>
                        </div>

                        {/* Nav links */}
                        <div className="py-1">
                            <Link href={`/profile/${user?.username}`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <User size={15} /> {t.menu.profile}
                            </Link>
                            <Link href={`/profile/${user?.username}/films`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <Film size={15} /> {t.menu.films}
                            </Link>
                            <Link href={`/profile/${user?.username}/diary`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <BookOpen size={15} /> {t.menu.diary}
                            </Link>
                            <Link href={`/profile/${user?.username}/reviews`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <Star size={15} /> {t.menu.reviews}
                            </Link>
                            <Link href={`/profile/${user?.username}/lists`} onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-text text-sm hover:bg-text/5 hover:text-white transition-colors">
                                <List size={15} /> {t.menu.lists}
                            </Link>
                        </div>

                        {/* Language picker */}
                        <div className="border-t border-text/10 px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Globe size={13} className="text-text-muted" />
                                <span className="font-roboto text-xs text-text-muted">{t.menu.language}</span>
                            </div>
                            <div className="flex gap-1.5">
                                {LANGS.map(l => (
                                    <button
                                        key={l.code}
                                        onClick={() => setLang(l.code)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-roboto text-xs font-medium transition-colors ${
                                            lang === l.code
                                                ? 'bg-purple text-white'
                                                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-text'
                                        }`}
                                    >
                                        <span>{l.flag}</span>
                                        <span>{l.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Log out */}
                        <div className="border-t border-text/10 py-1">
                            <button
                                onClick={() => { logout(); setOpen(false); router.push('/') }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 text-sm hover:bg-red-400/10 transition-colors"
                            >
                                <LogOut size={15} /> {t.menu.logout}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default function Navbar() {
    const user       = useAuthStore(s => s.user)
    const lang       = useLanguageStore(s => s.lang)
    const t          = useT(lang)
    const [searchOpen, setSearchOpen] = useState(false)

    return (
        <>
        <nav className='sticky top-0 z-50 bg-bg-dark'>

            {/* Desktop */}
            <div className='hidden md:flex items-center justify-between px-12 xl:px-60 h-[84px]'>
                <Link href={user ? "/home" : "/"} className="flex items-center gap-2">
                    <Image src="/images/lumray-icon.svg" alt="Lumray" width={42} height={42} />
                    <span className="font-outfit text-2xl font-bold text-white">lumray</span>
                </Link>

                <div className='flex items-center gap-4'>
                    <NavLink href="/home">{t.nav.home}</NavLink>
                    <NavLink href="/films">{t.nav.films}</NavLink>
                    <NavLink href="/community">{t.nav.community}</NavLink>
                    <NavLink href="/lists">{t.nav.lists}</NavLink>
                    <div className="w-px h-5 bg-text/20 mx-1" />
                    <button onClick={() => setSearchOpen(true)} className="text-text hover:text-white transition-colors">
                        <Search size={20} />
                    </button>
                    {user && (
                        <>
                            <Link href="/messages" className="text-text hover:text-white transition-colors" aria-label="Messages">
                                <MessageSquare size={20} />
                            </Link>
                            <button className="relative text-text hover:text-white transition-colors">
                                <Bell size={20} />
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple rounded-full" />
                            </button>
                        </>
                    )}
                    {user ? (
                        <UserMenu />
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-text font-medium text-base hover:text-purple-light">{t.auth.login}</Link>
                            <Link href="/signup" className="bg-purple text-white font-medium text-base px-4 py-2 rounded-full hover:bg-purple-deep transition-colors whitespace-nowrap">{t.auth.signup}</Link>
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
                        <button onClick={() => setSearchOpen(true)} className="text-text hover:text-white transition-colors">
                            <Search size={18} />
                        </button>
                        {user ? (
                            <>
                                <Link href="/messages" className="text-text hover:text-white transition-colors" aria-label="Messages">
                                    <MessageSquare size={18} />
                                </Link>
                                <button className="relative text-text hover:text-white transition-colors">
                                    <Bell size={18} />
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple rounded-full" />
                                </button>
                                <UserMenu />
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-text font-medium text-sm hover:text-purple-light">{t.auth.login}</Link>
                                <Link href="/signup" className="bg-purple text-white font-medium text-sm px-4 py-2 rounded-full hover:bg-purple-deep transition-colors whitespace-nowrap">{t.auth.signup}</Link>
                            </>
                        )}
                    </div>
                </div>
                <div className='border-t border-text/10 flex items-center justify-center gap-8 h-11 px-6'>
                    <NavLink href="/home" mobile>{t.nav.home}</NavLink>
                    <NavLink href="/films" mobile>{t.nav.films}</NavLink>
                    <NavLink href="/community" mobile>{t.nav.community}</NavLink>
                    <NavLink href="/lists" mobile>{t.nav.lists}</NavLink>
                </div>
            </div>

        </nav>

        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
        </>
    )
}
