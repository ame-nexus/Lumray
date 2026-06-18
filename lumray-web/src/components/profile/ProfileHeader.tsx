'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Share2, Check, X, Loader2 } from 'lucide-react'
import { nameInitials } from '@/lib/tmdbImage'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import FollowButton from '@/components/ui/FollowButton'
import api from '@/services/api'

export interface ProfileHeaderProps {
  username: string
  userId: string
  name: string | null
  bio: string | null
  avatar: string | null
  coverImage: string | null
  memberSince: string
  isOwnProfile: boolean
  stats: {
    totalFilms: number
    thisYear: number
    following: number
    followers: number
  }
}

interface SimpleUser {
  id: string
  username: string
  avatar: string | null
  name: string | null
}

function memberSinceYear(iso: string): string {
  const year = iso.slice(0, 4)
  return year.length === 4 ? year : '2024'
}

function FollowModal({
  title,
  users,
  loading,
  onClose,
}: {
  title: string
  users: SimpleUser[]
  loading: boolean
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-text/10 bg-surface shadow-xl flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-text/10">
          <h3 className="font-outfit text-base font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 py-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-text-muted" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-10 text-center font-roboto text-sm text-text-muted">No users yet.</p>
          ) : (
            users.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/5 transition-colors"
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-2">
                  {u.avatar ? (
                    <Image src={u.avatar} alt={u.username} fill sizes="36px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-text uppercase">
                      {u.username[0]}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-roboto text-sm font-semibold text-text truncate">{u.name ?? u.username}</p>
                  {u.name && <p className="font-roboto text-xs text-text-muted truncate">@{u.username}</p>}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex flex-col items-center hover:opacity-80 transition-opacity">
        <span className="font-outfit text-xl font-bold text-white md:text-2xl">{value}</span>
        <span className="font-roboto text-xs text-white/60">{label}</span>
      </button>
    )
  }
  return (
    <div className="flex flex-col items-center">
      <span className="font-outfit text-xl font-bold text-white md:text-2xl">{value}</span>
      <span className="font-roboto text-xs text-white/60">{label}</span>
    </div>
  )
}

export default function ProfileHeader({
  username, userId, name, bio, avatar, coverImage,
  memberSince, isOwnProfile, stats,
}: ProfileHeaderProps) {
  const lang        = useLanguageStore(s => s.lang)
  const t           = useT(lang)
  const displayName    = name ?? username
  const validCover     = coverImage && /^https?:\/\//.test(coverImage) ? coverImage : null
  const validAvatar    = avatar && /^https?:\/\//.test(avatar) ? avatar : null
  const [copied, setCopied] = useState(false)

  const [modal,        setModal]        = useState<'following' | 'followers' | null>(null)
  const [modalUsers,   setModalUsers]   = useState<SimpleUser[]>([])
  const [modalLoading, setModalLoading] = useState(false)

  async function openModal(type: 'following' | 'followers') {
    setModal(type)
    setModalLoading(true)
    setModalUsers([])
    try {
      const endpoint = type === 'following'
        ? `/api/users/${username}/following-list`
        : `/api/users/${username}/followers-list`
      const res = await api.get(endpoint)
      setModalUsers(res.data.data ?? [])
    } catch {
      setModalUsers([])
    } finally {
      setModalLoading(false)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/profile/${username}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${displayName} on Lumray`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }
    } catch { /* user cancelled share or clipboard blocked — ignore */ }
  }

  const stats1 = (
    <>
      <StatItem value={stats.totalFilms} label={t.profile.films} />
      <div className="h-8 w-px bg-white/20" />
      <StatItem value={stats.thisYear} label={t.profile.thisYear} />
      <div className="h-8 w-px bg-white/20" />
      <StatItem value={stats.following} label={t.profile.following} onClick={() => openModal('following')} />
      <div className="h-8 w-px bg-white/20" />
      <StatItem value={stats.followers} label={t.profile.followers} onClick={() => openModal('followers')} />
    </>
  )

  return (
    <>
      <section className="relative h-64 w-full overflow-hidden md:h-80 xl:h-96">
        {/* Cover image */}
        {validCover ? (
          <Image src={validCover} alt="" fill priority className="object-cover object-center" sizes="100vw" />
        ) : (
          <div className="h-full w-full bg-linear-to-r from-bg-dark via-bg to-surface" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-bg from-5% via-bg/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-6 md:px-12 xl:px-60">
          <div className="flex items-end justify-between gap-6">

            {/* Left — avatar + name + bio */}
            <div className="flex min-w-0 items-end gap-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-black/40 md:h-28 md:w-28">
                {validAvatar ? (
                  <Image src={validAvatar} alt={displayName} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-purple">
                    <span className="font-outfit text-2xl font-semibold text-white">
                      {nameInitials(displayName)}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-outfit text-2xl font-bold text-white drop-shadow md:text-3xl">
                    {displayName}
                  </h1>
                  {isOwnProfile ? (
                    <Link
                      href="/settings"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-roboto text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                    >
                      <Pencil size={12} />
                      {t.profile.editProfile}
                    </Link>
                  ) : (
                    <FollowButton userId={userId} />
                  )}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-roboto text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                  >
                    {copied ? <Check size={12} /> : <Share2 size={12} />}
                    {copied ? 'Copied!' : 'Share'}
                  </button>
                </div>

                <p className="mt-1 font-roboto text-xs text-white/60">
                  {t.profile.memberSince} {memberSinceYear(memberSince)}
                </p>

                {bio && (
                  <p className="mt-2 max-w-xl font-roboto text-sm leading-relaxed text-white/80 line-clamp-2">
                    {bio}
                  </p>
                )}
              </div>
            </div>

            {/* Right — stats (desktop) */}
            <div className="hidden shrink-0 items-center gap-5 pb-1 md:flex lg:gap-8">
              {stats1}
            </div>
          </div>

          {/* Stats row on mobile */}
          <div className="mt-3 flex items-center gap-5 md:hidden">
            {stats1}
          </div>
        </div>
      </section>

      {modal && (
        <FollowModal
          title={modal === 'following' ? `Following (${stats.following})` : `Followers (${stats.followers})`}
          users={modalUsers}
          loading={modalLoading}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
