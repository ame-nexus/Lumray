'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Search, Loader2, Check, ChevronLeft, Camera, Upload } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import api from '@/services/api'
import { tmdbPoster } from '@/lib/tmdbImage'
import Link from 'next/link'

// ── types ──────────────────────────────────────────────────────────────────

interface Favourite {
  id: string
  tmdbId: number
  title: string
  posterPath: string | null
}

interface SearchMovie {
  tmdbId: number
  title: string
  posterPath: string | null
  releaseYear: string | null
}

// ── image uploader hook ────────────────────────────────────────────────────

function useImageUpload(endpoint: '/api/upload/avatar' | '/api/upload/cover') {
  const [url,       setUrl]       = useState<string | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function trigger() { inputRef.current?.click() }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post(endpoint, form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const cloudUrl: string = res.data.data.url
      setUrl(cloudUrl)
      setPreview(null)
      URL.revokeObjectURL(objectUrl)
    } catch {
      setError('Upload failed. Try again.')
      setPreview(null)
      URL.revokeObjectURL(objectUrl)
    } finally {
      setUploading(false)
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return { url, setUrl, preview, uploading, error, trigger, inputRef, handleFile }
}

// ── film search modal ──────────────────────────────────────────────────────

function FilmPickerModal({
  current,
  onPick,
  onClose,
}: {
  current: number[]
  onPick: (movie: SearchMovie) => void
  onClose: () => void
}) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchMovie[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const q = query.trim()
    if (!q) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/search', { params: { q, type: 'movies', limit: 10 } })
        setResults(res.data.data?.movies ?? [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 350)
  }, [query])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-lg rounded-2xl bg-bg-dark shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-text/10 px-4 py-3">
          <Search size={16} className="shrink-0 text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a film…"
            className="flex-1 bg-transparent font-roboto text-sm text-text outline-none placeholder:text-text-muted"
          />
          {loading && <Loader2 size={14} className="animate-spin text-text-muted" />}
          <button onClick={onClose} className="text-text-muted hover:text-text"><X size={16} /></button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && !loading && query.trim() && (
            <p className="py-8 text-center font-roboto text-sm text-text-muted">No results found.</p>
          )}
          {results.length === 0 && !query.trim() && (
            <p className="py-8 text-center font-roboto text-sm text-text-muted">Type to search for a film.</p>
          )}
          {results.map((movie) => {
            const alreadyPicked = current.includes(movie.tmdbId)
            const src = movie.posterPath ? tmdbPoster(movie.posterPath, 'w185') : null
            return (
              <button
                key={movie.tmdbId}
                onClick={() => !alreadyPicked && onPick(movie)}
                disabled={alreadyPicked}
                className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/60 disabled:opacity-50"
              >
                <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-surface-2">
                  {src && <Image src={src} alt={movie.title} fill className="object-cover" sizes="32px" />}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-roboto text-sm font-medium text-text line-clamp-1">{movie.title}</p>
                  {movie.releaseYear && <p className="font-roboto text-xs text-text-muted">{movie.releaseYear}</p>}
                </div>
                {alreadyPicked && <Check size={14} className="shrink-0 text-purple-light" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── settings page ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router         = useRouter()
  const authUser       = useAuthStore(s => s.user)
  const setCredentials = useAuthStore(s => s.setCredentials)
  const token          = useAuthStore(s => s.token)

  const avatarUpload = useImageUpload('/api/upload/avatar')
  const coverUpload  = useImageUpload('/api/upload/cover')

  const [name,     setName]     = useState('')
  const [username, setUsername] = useState('')
  const [bio,      setBio]      = useState('')

  const [favourites,  setFavourites]  = useState<Favourite[]>([])
  const [pickerOpen,  setPickerOpen]  = useState(false)
  const [favLoading,  setFavLoading]  = useState(false)

  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => { if (authUser === null) router.push('/login') }, [authUser, router])

  useEffect(() => {
    if (!authUser) return
    setName(authUser.name ?? '')
    setUsername(authUser.username ?? '')
    setBio(authUser.bio ?? '')
    avatarUpload.setUrl(authUser.avatar ?? null)
    coverUpload.setUrl(authUser.coverImage ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id])

  useEffect(() => {
    if (!authUser) return
    setFavLoading(true)
    api.get(`/api/users/${authUser.username}/favourites`)
      .then(res => setFavourites(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setFavLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id])

  if (!authUser) return null

  const avatarSrc  = avatarUpload.preview  ?? avatarUpload.url  ?? null
  const coverSrc   = coverUpload.preview   ?? coverUpload.url   ?? null
  const displayName = name || username

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!authUser) return
    const currentUser = authUser
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await api.put('/api/users/me', {
        name,
        username,
        bio,
        avatar:     avatarUpload.url ?? currentUser.avatar,
        coverImage: coverUpload.url  ?? currentUser.coverImage,
      })
      const updated = res.data.data
      setCredentials({
        id:            currentUser.id,
        email:         currentUser.email,
        emailVerified: currentUser.emailVerified,
        points:        currentUser.points,
        level:         currentUser.level,
        name:          updated.name       ?? null,
        username:      updated.username   ?? currentUser.username,
        bio:           updated.bio        ?? null,
        avatar:        updated.avatar     ?? null,
        coverImage:    updated.coverImage ?? null,
      }, token!)
      setSaved(true)
      setTimeout(() => router.push(`/profile/${updated.username ?? authUser.username}`), 1000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePickFavourite(movie: SearchMovie) {
    setPickerOpen(false)
    if (favourites.length >= 4) return
    setFavLoading(true)
    try {
      const cacheRes = await api.get(`/api/movies/${movie.tmdbId}`)
      const dbId: string = cacheRes.data.data?.id
      if (!dbId) return
      await api.post(`/api/film-status/${dbId}/favourite`)
      setFavourites(prev => [...prev, { id: dbId, tmdbId: movie.tmdbId, title: movie.title, posterPath: movie.posterPath }])
    } catch { /* silent */ }
    finally { setFavLoading(false) }
  }

  async function removeFavourite(fav: Favourite) {
    setFavLoading(true)
    try {
      await api.post(`/api/film-status/${fav.id}/favourite`)
      setFavourites(prev => prev.filter(f => f.id !== fav.id))
    } catch { /* silent */ }
    finally { setFavLoading(false) }
  }

  const pickedTmdbIds = favourites.map(f => f.tmdbId)

  return (
    <div className="min-h-screen bg-bg px-4 py-10 md:px-8 xl:px-0">
      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <div className="mb-8">
          <Link href={`/profile/${authUser.username}`} className="inline-flex items-center gap-1 font-roboto text-sm text-text-muted transition-colors hover:text-text">
            <ChevronLeft size={16} /> Back to profile
          </Link>
        </div>

        <h1 className="mb-8 font-outfit text-2xl font-bold text-text">Edit Profile</h1>

        {/* ── Cover photo ── */}
        <section className="mb-6 overflow-hidden rounded-xl border border-text/10 bg-surface">
          <div className="group relative h-40 w-full overflow-hidden">
            {coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverSrc} alt="Cover" className="h-full w-full object-cover object-center" />
            ) : (
              <div className="h-full w-full bg-linear-to-r from-bg-dark to-surface" />
            )}

            {/* Upload overlay */}
            <button
              type="button"
              onClick={coverUpload.trigger}
              disabled={coverUpload.uploading}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 transition-colors group-hover:bg-black/50"
            >
              <div className="flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {coverUpload.uploading
                  ? <Loader2 size={28} className="animate-spin text-white" />
                  : <Upload size={28} className="text-white" />
                }
                <span className="font-roboto text-xs font-medium text-white">
                  {coverUpload.uploading ? 'Uploading…' : 'Change cover photo'}
                </span>
              </div>
            </button>

            <input
              ref={coverUpload.inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={coverUpload.handleFile}
            />
          </div>

          {coverUpload.error && (
            <p className="px-5 py-2 font-roboto text-xs text-red-400">{coverUpload.error}</p>
          )}

          <div className="px-5 py-3">
            <p className="font-roboto text-xs text-text-muted">
              Click the image above to upload a cover photo from your device. JPEG, PNG or WebP, max 5 MB.
            </p>
          </div>
        </section>

        {/* ── Profile info form ── */}
        <form onSubmit={saveProfile}>
          <section className="mb-6 space-y-5 rounded-xl border border-text/10 bg-surface p-5">
            <h2 className="font-outfit text-base font-semibold text-text">Profile Info</h2>

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="group relative h-20 w-20 shrink-0">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-purple ring-2 ring-bg">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-outfit text-xl font-semibold text-white">
                        {displayName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Camera button */}
                <button
                  type="button"
                  onClick={avatarUpload.trigger}
                  disabled={avatarUpload.uploading}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-purple shadow-lg ring-2 ring-bg transition-colors hover:bg-purple-deep disabled:opacity-60"
                >
                  {avatarUpload.uploading
                    ? <Loader2 size={13} className="animate-spin text-white" />
                    : <Camera size={13} className="text-white" />
                  }
                </button>

                <input
                  ref={avatarUpload.inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={avatarUpload.handleFile}
                />
              </div>

              <div>
                <p className="font-roboto text-sm font-medium text-text">{displayName || 'Your name'}</p>
                <p className="font-roboto text-xs text-text-muted">@{username}</p>
                {avatarUpload.error && <p className="mt-1 font-roboto text-xs text-red-400">{avatarUpload.error}</p>}
                <button
                  type="button"
                  onClick={avatarUpload.trigger}
                  className="mt-2 font-roboto text-xs text-purple-light hover:text-text transition-colors"
                >
                  Change profile photo
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1 block font-roboto text-xs font-medium text-text-muted">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-text/15 bg-bg px-3 py-2 font-roboto text-sm text-text outline-none placeholder:text-text-muted focus:border-purple"
              />
            </div>

            {/* Username */}
            <div>
              <label className="mb-1 block font-roboto text-xs font-medium text-text-muted">Username</label>
              <div className="flex items-center gap-2 rounded-lg border border-text/15 bg-bg px-3 py-2 focus-within:border-purple">
                <span className="font-roboto text-sm text-text-muted">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  maxLength={20}
                  className="flex-1 bg-transparent font-roboto text-sm text-text outline-none placeholder:text-text-muted"
                />
              </div>
              <p className="mt-1 font-roboto text-xs text-text-muted">3–20 chars · letters, numbers, underscores</p>
            </div>

            {/* Bio */}
            <div>
              <label className="mb-1 block font-roboto text-xs font-medium text-text-muted">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell the community about yourself…"
                className="w-full resize-none rounded-lg border border-text/15 bg-bg px-3 py-2 font-roboto text-sm text-text outline-none placeholder:text-text-muted focus:border-purple"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 font-roboto text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving || avatarUpload.uploading || coverUpload.uploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple py-2.5 font-outfit text-sm font-semibold text-white transition-colors hover:bg-purple-deep disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
            </button>
          </section>
        </form>

        {/* ── Favourite films ── */}
        <section className="rounded-xl border border-text/10 bg-surface p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-outfit text-base font-semibold text-text">Favourite Films</h2>
              <p className="font-roboto text-xs text-text-muted">Pick up to 4 films that define your taste.</p>
            </div>
            {favourites.length < 4 && (
              <button
                onClick={() => setPickerOpen(true)}
                disabled={favLoading}
                className="rounded-lg border border-purple/50 bg-purple/10 px-3 py-1.5 font-roboto text-xs text-purple-light transition-colors hover:bg-purple/20 disabled:opacity-50"
              >
                + Add film
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => {
              const fav = favourites[i]
              if (fav) {
                const src = fav.posterPath ? tmdbPoster(fav.posterPath, 'w300') : null
                return (
                  <div key={fav.id} className="group relative aspect-2/3 overflow-hidden rounded-lg bg-surface-2">
                    {src ? (
                      <Image src={src} alt={fav.title} fill className="object-cover" sizes="25vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-2 text-center">
                        <span className="font-roboto text-[10px] text-text-muted">{fav.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/50">
                      <button
                        onClick={() => removeFavourite(fav)}
                        disabled={favLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )
              }
              return (
                <button
                  key={`empty-${i}`}
                  onClick={() => setPickerOpen(true)}
                  disabled={favLoading}
                  className="aspect-2/3 flex items-center justify-center rounded-lg border border-dashed border-text/20 bg-surface-2/50 transition-colors hover:border-purple/50 hover:bg-purple/5 disabled:opacity-50"
                >
                  <span className="font-outfit text-2xl text-text-muted">+</span>
                </button>
              )
            })}
          </div>

          {favLoading && (
            <div className="mt-3 flex items-center justify-center gap-2 font-roboto text-xs text-text-muted">
              <Loader2 size={13} className="animate-spin" /> Updating…
            </div>
          )}
        </section>

      </div>

      {pickerOpen && (
        <FilmPickerModal
          current={pickedTmdbIds}
          onPick={handlePickFavourite}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}
