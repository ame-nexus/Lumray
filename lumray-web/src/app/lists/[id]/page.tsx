'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Lock, Globe, Pencil, Trash2, Check, X, Film } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import api from '@/services/api'

interface ListMovie {
  id: string
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string | null
  voteAverage: number
}

interface ListItem {
  id: string
  order: number
  notes: string | null
  movie: ListMovie
}

interface ListDetail {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  updatedAt: string
  user: { id: string; username: string; avatar: string | null }
  _count: { items: number }
  items: ListItem[]
}

export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params.id as string
  const user   = useAuthStore(s => s.user)
  const lang   = useLanguageStore(s => s.lang)
  const t      = useT(lang)

  const [list,       setList]       = useState<ListDetail | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [editing,    setEditing]    = useState(false)
  const [editName,   setEditName]   = useState('')
  const [editDesc,   setEditDesc]   = useState('')
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  useEffect(() => {
    api.get(`/api/lists/${id}`)
      .then(res => setList(res.data.data))
      .catch(err => {
        if (err.response?.status === 404 || err.response?.status === 403) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  function startEdit() {
    if (!list) return
    setEditName(list.name)
    setEditDesc(list.description ?? '')
    setEditing(true)
  }

  async function saveEdit() {
    if (!list || !editName.trim()) return
    setSaving(true)
    try {
      const res = await api.put(`/api/lists/${list.id}`, {
        name: editName.trim(),
        description: editDesc.trim() || null,
        isPublic: list.isPublic,
      })
      setList(res.data.data)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!list) return
    if (!window.confirm(t.list.confirmDelete)) return
    setDeleting(true)
    try {
      await api.delete(`/api/lists/${list.id}`)
      router.push('/lists')
    } finally {
      setDeleting(false)
    }
  }

  const isOwner = user && list && user.id === list.user.id

  if (loading) {
    return (
      <main className="px-6 md:px-12 xl:px-60 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-surface" />
          <div className="h-4 w-48 rounded bg-surface" />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 mt-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-2/3 rounded-lg bg-surface" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !list) {
    return (
      <main className="flex flex-col items-center justify-center px-6 py-40 text-center">
        <p className="font-outfit text-2xl font-bold text-white">List not found</p>
        <Link href="/lists" className="mt-4 font-roboto text-sm text-purple-light hover:underline">
          {t.list.browse}
        </Link>
      </main>
    )
  }

  return (
    <main className="px-6 md:px-12 xl:px-60 py-10">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 font-roboto text-sm text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={15} />
        {t.list.browse}
      </button>

      {/* Header */}
      <div className="mb-8">
        {editing ? (
          <div className="space-y-3 max-w-lg">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder={t.list.editName}
              className="w-full rounded-lg border border-text/20 bg-surface px-4 py-2.5 font-outfit text-xl font-bold text-white focus:border-purple/50 focus:outline-none"
            />
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full rounded-lg border border-text/20 bg-surface px-4 py-2.5 font-roboto text-sm text-text placeholder:text-text-muted focus:border-purple/50 focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={saving || !editName.trim()}
                className="flex items-center gap-1.5 rounded-full bg-purple px-4 py-1.5 font-roboto text-sm text-white hover:bg-purple-deep disabled:opacity-40"
              >
                <Check size={14} />
                {saving ? '…' : t.list.save}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 rounded-full border border-text/20 px-4 py-1.5 font-roboto text-sm text-text hover:border-text/40"
              >
                <X size={14} />
                {t.list.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-outfit text-3xl font-bold text-white">{list.name}</h1>
                {list.isPublic
                  ? <Globe size={16} className="shrink-0 text-text-muted" />
                  : <Lock  size={16} className="shrink-0 text-text-muted" />
                }
              </div>
              {list.description && (
                <p className="mt-1 font-roboto text-sm text-text-muted max-w-2xl">{list.description}</p>
              )}
              <p className="mt-2 font-roboto text-sm text-text-muted">
                {list._count.items} {t.list.films} · {t.list.by}{' '}
                <Link href={`/profile/${list.user.username}`} className="text-purple-light hover:underline">
                  @{list.user.username}
                </Link>
              </p>
            </div>

            {isOwner && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 rounded-full border border-text/20 px-3 py-1.5 font-roboto text-xs text-text transition-colors hover:border-text/40"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 font-roboto text-xs text-red-400 transition-colors hover:border-red-500/60 disabled:opacity-40"
                >
                  <Trash2 size={13} />
                  {t.list.deleteList}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Films grid */}
      {list.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Film size={48} className="mb-4 text-text-muted opacity-30" />
          <p className="font-roboto text-text-muted">{t.list.emptyList}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 md:gap-3">
          {list.items.map((item, index) => {
            const poster = item.movie.posterPath
              ? `https://image.tmdb.org/t/p/w300${item.movie.posterPath}`
              : null
            const year = item.movie.releaseDate?.slice(0, 4)

            return (
              <Link key={item.id} href={`/films/${item.movie.tmdbId}`} className="group relative">
                <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface-2">
                  {/* Order badge */}
                  <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 font-roboto text-[11px] font-bold text-white">
                    {index + 1}
                  </div>

                  {poster ? (
                    <Image
                      src={poster}
                      alt={item.movie.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2">
                      <span className="text-center font-roboto text-[10px] text-text-muted">{item.movie.title}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <p className="font-roboto text-[10px] font-medium text-white line-clamp-2">{item.movie.title}</p>
                    {year && <p className="font-roboto text-[9px] text-white/70">{year}</p>}
                  </div>
                </div>

                {item.notes && (
                  <p className="mt-1.5 font-roboto text-[10px] text-text-muted line-clamp-2 px-0.5">{item.notes}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
