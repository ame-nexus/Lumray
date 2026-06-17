'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Film } from 'lucide-react'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import api from '@/services/api'

interface ListItem {
  movie: { posterPath: string | null; title: string }
}

interface PublicList {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  updatedAt: string
  user: { username: string; avatar: string | null }
  _count: { items: number }
  items: ListItem[]
}

function ListCard({ list }: { list: PublicList }) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  const posters = list.items.slice(0, 4).map(i => i.movie.posterPath)

  return (
    <Link href={`/lists/${list.id}`} className="group block rounded-xl bg-surface border border-text/10 overflow-hidden hover:border-purple/40 transition-colors">
      {/* Poster strip */}
      <div className="flex h-28 overflow-hidden bg-bg-dark">
        {posters.length > 0 ? (
          posters.map((p, i) => (
            <div key={i} className="relative flex-1 overflow-hidden">
              {p ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${p}`}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="25vw"
                />
              ) : (
                <div className="h-full w-full bg-surface-2" />
              )}
            </div>
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film size={32} className="text-text-muted opacity-40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-outfit text-base font-semibold text-white line-clamp-1 group-hover:text-purple-light transition-colors">
          {list.name}
        </h3>
        {list.description && (
          <p className="mt-1 font-roboto text-xs text-text-muted line-clamp-2">{list.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-roboto text-xs text-text-muted">
            {list._count.items} {t.list.films}
          </span>
          <span className="font-roboto text-xs text-purple-light">
            {t.list.by} @{list.user.username}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ListsPage() {
  return (
    <Suspense fallback={null}>
      <ListsPageContent />
    </Suspense>
  )
}

function ListsPageContent() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const lang         = useLanguageStore(s => s.lang)
  const t            = useT(lang)

  const page = parseInt(searchParams.get('page') || '1', 10)
  const q    = searchParams.get('q') || ''

  const [lists,      setLists]      = useState<PublicList[]>([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState(q)

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const fetchLists = useCallback(() => {
    setLoading(true)
    api.get('/api/lists/all', { params: { page, ...(q ? { q } : {}) } })
      .then(res => {
        setLists(res.data.data.lists)
        setTotal(res.data.data.total)
        setTotalPages(res.data.data.totalPages)
      })
      .catch(() => setLists([]))
      .finally(() => setLoading(false))
  }, [page, q])

  useEffect(() => { fetchLists() }, [fetchLists])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ q: search || null, page: null })
  }

  return (
    <main className="px-6 md:px-12 xl:px-60 py-10">

      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl md:text-4xl font-bold text-white">{t.list.browse}</h1>
          <p className="mt-1 font-roboto text-text-muted">{t.list.subtitle}</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.list.searchPlaceholder}
            className="w-full rounded-full border border-text/20 bg-surface py-2.5 pl-10 pr-4 font-roboto text-sm text-text placeholder:text-text-muted focus:border-purple/50 focus:outline-none"
          />
        </div>
      </form>

      {total > 0 && !loading && (
        <p className="mb-4 font-roboto text-sm text-text-muted">
          {total.toLocaleString()} {t.list.listsFound}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-surface">
              <div className="h-28 bg-surface-2" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-surface-2" />
                <div className="h-3 w-1/2 rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-roboto text-text-muted">{t.list.emptyBrowse}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {lists.map(list => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
            disabled={page === 1}
            className="rounded-full border border-text/20 px-6 py-2 font-roboto text-sm font-medium text-text transition-colors disabled:opacity-30 hover:border-text/40"
          >
            {t.list.prev}
          </button>
          <span className="font-roboto text-sm text-text-muted">{t.list.page} {page} {t.list.of} {totalPages}</span>
          <button
            onClick={() => updateParams({ page: String(page + 1) })}
            disabled={page >= totalPages}
            className="rounded-full bg-purple px-6 py-2 font-roboto text-sm font-medium text-white transition-colors hover:bg-purple-deep disabled:opacity-30"
          >
            {t.list.next}
          </button>
        </div>
      )}
    </main>
  )
}
