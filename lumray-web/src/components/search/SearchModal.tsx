'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, Clock, X, Film, Users, List } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/services/api'

// ── types ──────────────────────────────────────────────────────

type Tab = 'all' | 'films' | 'people' | 'lists'

interface SearchMovie {
    tmdbId:      number
    title:       string
    posterPath:  string | null
    releaseYear: string | null
}
interface SearchPerson {
    tmdbId:      number
    name:        string
    profilePath: string | null
    department:  string | null
}
interface SearchList {
    id:     string
    name:   string
    user:   { username: string }
    _count: { items: number }
    items:  { movie: { posterPath: string | null } }[]
}
interface SearchResults {
    movies:  SearchMovie[]
    persons: SearchPerson[]
    lists:   SearchList[]
}

// ── constants & helpers ────────────────────────────────────────

const STORAGE_KEY = 'lumray:recent-searches'
const MAX_RECENT  = 6
const IMG         = 'https://image.tmdb.org/t/p'

// Tab config
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'all',    label: 'All',        icon: <Search size={13} /> },
    { key: 'films',  label: 'Films',      icon: <Film   size={13} /> },
    { key: 'people', label: 'Cast & Crew',icon: <Users  size={13} /> },
    { key: 'lists',  label: 'Lists',      icon: <List   size={13} /> },
]

// Per-tab API params
const TAB_PARAMS: Record<Tab, { type: string; limit: number }> = {
    all:    { type: 'all',     limit: 6  },
    films:  { type: 'movies',  limit: 12 },
    people: { type: 'persons', limit: 10 },
    lists:  { type: 'lists',   limit: 8  },
}

// Module-level cache so it survives re-renders
const resultCache = new Map<string, SearchResults>()

function getRecent(): string[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveRecent(term: string) {
    const prev = getRecent().filter(t => t !== term)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([term, ...prev].slice(0, MAX_RECENT)))
}
function removeRecent(term: string) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getRecent().filter(t => t !== term)))
}

// ── small reusable pieces ──────────────────────────────────────

function Poster({ path, title }: { path: string | null; title: string }) {
    return path ? (
        <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '2/3' }}>
            <Image src={`${IMG}/w185${path}`} alt={title} fill className="object-cover" sizes="120px" />
        </div>
    ) : (
        <div className="w-full rounded-lg bg-[#383a47] flex items-center justify-center" style={{ aspectRatio: '2/3' }}>
            <Film size={20} className="text-[#7a7882]" />
        </div>
    )
}

function Avatar({ path, name, size = 40 }: { path: string | null; name: string; size?: number }) {
    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-full bg-[#714ee4]"
            style={{ width: size, height: size }}
        >
            {path ? (
                <Image src={`${IMG}/w185${path}`} alt={name} fill className="object-cover" sizes={`${size}px`} />
            ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                    {name[0]?.toUpperCase()}
                </span>
            )}
        </div>
    )
}

function PosterRow({ path }: { path: string | null }) {
    return path ? (
        <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
            <Image src={`${IMG}/w92${path}`} alt="" fill className="object-cover" sizes="32px" />
        </div>
    ) : (
        <div className="h-12 w-8 shrink-0 rounded bg-[#383a47]" />
    )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 px-5 pb-1.5 pt-4 first:pt-2">
            <span className="text-[#7a7882]">{icon}</span>
            <span className="font-outfit text-[10px] font-bold uppercase tracking-widest text-[#7a7882]">{label}</span>
        </div>
    )
}

function Skeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="space-y-2 p-5">
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="h-11 animate-pulse rounded-lg bg-white/5" />
            ))}
        </div>
    )
}

// ── tab views ──────────────────────────────────────────────────

function FilmsGrid({ movies, onPick }: { movies: SearchMovie[]; onPick: (t: string) => void }) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-5">
            {movies.map(m => (
                <Link
                    key={m.tmdbId}
                    href={`/films/${m.tmdbId}`}
                    onClick={() => onPick(m.title)}
                    className="group flex flex-col gap-1.5"
                >
                    <div className="overflow-hidden rounded-lg ring-1 ring-white/10 group-hover:ring-[#714ee4] transition-all">
                        <Poster path={m.posterPath} title={m.title} />
                    </div>
                    <p className="font-outfit text-[11px] font-medium text-[#ede9fc] leading-tight truncate">{m.title}</p>
                    {m.releaseYear && <p className="font-roboto text-[10px] text-[#7a7882]">{m.releaseYear}</p>}
                </Link>
            ))}
        </div>
    )
}

function PeopleGrid({ persons, onPick }: { persons: SearchPerson[]; onPick: (t: string) => void }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-3">
            {persons.map(p => (
                <Link
                    key={p.tmdbId}
                    href={`/person/${p.tmdbId}`}
                    onClick={() => onPick(p.name)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                    <Avatar path={p.profilePath} name={p.name} size={44} />
                    <div className="min-w-0">
                        <p className="font-outfit text-sm font-medium text-[#ede9fc] truncate">{p.name}</p>
                        {p.department && (
                            <p className="font-roboto text-xs text-[#7a7882] capitalize">{p.department}</p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    )
}

function ListsView({ lists, onPick }: { lists: SearchList[]; onPick: (t: string) => void }) {
    return (
        <div className="flex flex-col gap-1 p-3">
            {lists.map(l => (
                <Link
                    key={l.id}
                    href={`/profile/${l.user.username}/lists/${l.id}`}
                    onClick={() => onPick(l.name)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                >
                    <div className="flex shrink-0 gap-0.5 overflow-hidden rounded-lg">
                        {Array.from({ length: 4 }, (_, i) => (
                            <PosterRow key={i} path={l.items[i]?.movie.posterPath ?? null} />
                        ))}
                    </div>
                    <div className="min-w-0">
                        <p className="font-outfit text-sm font-medium text-[#ede9fc] truncate">{l.name}</p>
                        <p className="font-roboto text-xs text-[#7a7882]">
                            {l._count.items} films · by <span className="text-[#b9a4fc]">{l.user.username}</span>
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    )
}

function AllView({ results, onPick }: { results: SearchResults; onPick: (t: string) => void }) {
    return (
        <div>
            {results.movies.length > 0 && (
                <>
                    <SectionLabel icon={<Film size={11} />} label="Films" />
                    <div className="flex flex-col gap-0.5 px-3">
                        {results.movies.map(m => (
                            <Link
                                key={m.tmdbId}
                                href={`/films/${m.tmdbId}`}
                                onClick={() => onPick(m.title)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
                            >
                                <PosterRow path={m.posterPath} />
                                <div className="min-w-0">
                                    <p className="font-outfit text-sm font-medium text-[#ede9fc] truncate">{m.title}</p>
                                    {m.releaseYear && <p className="font-roboto text-xs text-[#7a7882]">{m.releaseYear}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {results.persons.length > 0 && (
                <>
                    <SectionLabel icon={<Users size={11} />} label="Cast & Crew" />
                    <div className="flex flex-col gap-0.5 px-3">
                        {results.persons.map(p => (
                            <Link
                                key={p.tmdbId}
                                href={`/person/${p.tmdbId}`}
                                onClick={() => onPick(p.name)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
                            >
                                <Avatar path={p.profilePath} name={p.name} size={36} />
                                <div className="min-w-0">
                                    <p className="font-outfit text-sm font-medium text-[#ede9fc] truncate">{p.name}</p>
                                    {p.department && <p className="font-roboto text-xs text-[#7a7882] capitalize">{p.department}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {results.lists.length > 0 && (
                <>
                    <SectionLabel icon={<List size={11} />} label="Lists" />
                    <ListsView lists={results.lists} onPick={onPick} />
                </>
            )}
        </div>
    )
}

// ── main ───────────────────────────────────────────────────────

export default function SearchModal({ onClose }: { onClose: () => void }) {
    const [mounted,  setMounted]  = useState(false)
    const [query,    setQuery]    = useState('')
    const [tab,      setTab]      = useState<Tab>('all')
    const [results,  setResults]  = useState<SearchResults | null>(null)
    const [loading,  setLoading]  = useState(false)
    const [recent,   setRecent]   = useState<string[]>([])

    const inputRef      = useRef<HTMLInputElement>(null)
    const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortRef      = useRef<AbortController | null>(null)
    const origUrl       = useRef('')
    const navigating    = useRef(false)  // true when navigating to a result — skip URL restore

    // Mount: save URL, load recents, focus input
    useEffect(() => {
        setMounted(true)
        origUrl.current = window.location.href
        setRecent(getRecent())
        setTimeout(() => inputRef.current?.focus(), 40)
        return () => {
            // Only restore URL if we closed without navigating (Escape / backdrop)
            if (!navigating.current) {
                window.history.replaceState(null, '', origUrl.current)
            }
        }
    }, [])

    // Escape to close
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', h)
        return () => window.removeEventListener('keydown', h)
    }, [onClose])

    // Update URL bar as user types / changes tab
    useEffect(() => {
        if (!mounted) return
        const params = new URLSearchParams()
        const q = query.trim()
        if (q.length >= 2) {
            params.set('q', q)
            if (tab !== 'all') params.set('tab', tab)
        }
        const qs = params.toString()
        window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
    }, [query, tab, mounted])

    // Fetch with cache + abort
    const fetch = useCallback((q: string, t: Tab) => {
        if (timerRef.current) clearTimeout(timerRef.current)

        const trimmed = q.trim()
        if (trimmed.length < 2) { setResults(null); setLoading(false); return }

        // Instant cache hit — show immediately, no flash
        const cacheKey = `${trimmed.toLowerCase()}:${t}`
        const cached = resultCache.get(cacheKey)
        if (cached) { setResults(cached); setLoading(false); return }

        setLoading(true)
        timerRef.current = setTimeout(async () => {
            abortRef.current?.abort()
            abortRef.current = new AbortController()

            const { type, limit } = TAB_PARAMS[t]
            try {
                const res = await api.get(
                    `/api/search?q=${encodeURIComponent(trimmed)}&type=${type}&limit=${limit}`,
                    { signal: abortRef.current.signal }
                )
                const data = res.data.data as SearchResults
                resultCache.set(cacheKey, data)
                setResults(data)
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== 'CanceledError') setResults(null)
            } finally {
                setLoading(false)
            }
        }, 220)
    }, [])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value
        setQuery(v)
        fetch(v, tab)
    }

    function handleTabChange(t: Tab) {
        setTab(t)
        fetch(query, t)
    }

    function handleClear() {
        setQuery('')
        setResults(null)
        inputRef.current?.focus()
    }

    function handleResultClick(term: string) {
        saveRecent(term)
        navigating.current = true  // skip URL restore so Next.js navigation isn't overwritten
        onClose()
    }

    function handleRecentClick(term: string) {
        setQuery(term)
        fetch(term, tab)
        inputRef.current?.focus()
    }

    function handleRemoveRecent(e: React.MouseEvent, term: string) {
        e.stopPropagation()
        removeRecent(term)
        setRecent(getRecent())
    }

    const active    = query.trim().length >= 2
    const hasAny    = !!results && (results.movies.length > 0 || results.persons.length > 0 || results.lists.length > 0)
    const showEmpty = !recent.length && !active

    const tabCounts = results ? {
        all:    results.movies.length + results.persons.length + results.lists.length,
        films:  results.movies.length,
        people: results.persons.length,
        lists:  results.lists.length,
    } : null

    if (!mounted) return null

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[8vh] px-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#1e1f28] shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">

                {/* ── Search input ── */}
                <div className="flex items-center gap-3 px-5 py-4">
                    <Search
                        size={19}
                        className={`shrink-0 transition-colors ${loading ? 'text-[#714ee4] animate-pulse' : 'text-[#7a7882]'}`}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleChange}
                        placeholder="Search films, cast, crew, lists…"
                        className="flex-1 bg-transparent font-roboto text-[15px] text-[#ede9fc] placeholder-[#7a7882] outline-none"
                    />
                    {query && (
                        <button type="button" onClick={handleClear}
                            className="shrink-0 text-[#7a7882] hover:text-[#ede9fc] transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* ── Tabs (only when typing) ── */}
                {active && (
                    <div className="flex items-center gap-1 border-t border-white/8 px-4 py-2">
                        {TABS.map(({ key, label, icon }) => {
                            const count = tabCounts?.[key]
                            const isActive = tab === key
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleTabChange(key)}
                                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-outfit text-[12px] font-semibold transition-all ${
                                        isActive
                                            ? 'bg-[#714ee4] text-white'
                                            : 'text-[#7a7882] hover:bg-white/5 hover:text-[#ede9fc]'
                                    }`}
                                >
                                    {icon}
                                    {label}
                                    {count !== undefined && count > 0 && (
                                        <span className={`rounded-full px-1.5 py-px font-roboto text-[10px] ${
                                            isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-[#7a7882]'
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* ── Divider ── */}
                <div className="h-px bg-white/8" />

                {/* ── Body ── */}
                <div className="overflow-y-auto flex-1 min-h-0">

                    {/* Recent searches */}
                    {!active && recent.length > 0 && (
                        <div className="py-2">
                            <div className="flex items-center gap-2 px-5 py-2">
                                <Clock size={11} className="text-[#7a7882]" />
                                <span className="font-outfit text-[10px] font-bold uppercase tracking-widest text-[#7a7882]">Recent</span>
                            </div>
                            {recent.map(term => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => handleRecentClick(term)}
                                    className="flex w-full items-center gap-3 px-5 py-2.5 hover:bg-white/5 transition-colors"
                                >
                                    <Clock size={14} className="shrink-0 text-[#7a7882]" />
                                    <span className="flex-1 text-left font-roboto text-sm text-[#cfcfcf] truncate">{term}</span>
                                    <span
                                        role="button"
                                        onClick={e => handleRemoveRecent(e as unknown as React.MouseEvent, term)}
                                        className="shrink-0 text-[#7a7882] hover:text-[#ede9fc] p-0.5 rounded"
                                    >
                                        <X size={13} />
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty start state */}
                    {showEmpty && (
                        <div className="flex flex-col items-center gap-2 py-14">
                            <Search size={32} className="text-[#383a47]" />
                            <p className="font-roboto text-sm text-[#7a7882]">Search films, people and lists</p>
                        </div>
                    )}

                    {/* Loading (first load only) */}
                    {active && loading && !results && <Skeleton rows={4} />}

                    {/* No results */}
                    {active && !loading && results && !hasAny && (
                        <div className="flex flex-col items-center gap-2 py-14">
                            <p className="font-roboto text-sm text-[#7a7882]">
                                No results for <span className="text-[#ede9fc]">&ldquo;{query}&rdquo;</span>
                            </p>
                        </div>
                    )}

                    {/* Results by tab */}
                    {active && hasAny && (
                        <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                            {tab === 'all'    && <AllView    results={results!} onPick={handleResultClick} />}
                            {tab === 'films'  && <FilmsGrid  movies={results!.movies}  onPick={handleResultClick} />}
                            {tab === 'people' && <PeopleGrid persons={results!.persons} onPick={handleResultClick} />}
                            {tab === 'lists'  && <ListsView  lists={results!.lists}    onPick={handleResultClick} />}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="border-t border-white/8 px-5 py-2.5 flex items-center gap-5">
                    <span className="font-roboto text-[11px] text-[#7a7882]">
                        <kbd className="mr-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>open
                    </span>
                    <span className="font-roboto text-[11px] text-[#7a7882]">
                        <kbd className="mr-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>close
                    </span>
                    <span className="ml-auto font-roboto text-[11px] text-[#7a7882]">lumray search</span>
                </div>
            </div>
        </div>,
        document.body
    )
}
