'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Share2, Check } from 'lucide-react'
import { nameInitials } from '@/lib/tmdbImage'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import FollowButton from '@/components/ui/FollowButton'

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

function memberSinceYear(iso: string): string {
  const year = iso.slice(0, 4)
  return year.length === 4 ? year : '2024'
}

function StatItem({ value, label }: { value: number; label: string }) {
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
  const displayName = name ?? username
  const [copied, setCopied] = useState(false)

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

  return (
    <section className="relative h-64 w-full overflow-hidden md:h-80 xl:h-96">
      {/* Cover image */}
      {coverImage ? (
        <Image
          src={coverImage}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      ) : (
        <div className="h-full w-full bg-linear-to-r from-bg-dark via-bg to-surface" />
      )}

      {/* Bottom fade — blends into page background, same as movie hero */}
      <div className="absolute inset-0 bg-linear-to-t from-bg from-5% via-bg/40 to-transparent" />
      {/* Extra bottom dark layer so text stays legible */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/60 to-transparent" />

      {/* Content pinned to bottom of cover */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 md:px-12 xl:px-60">
        <div className="flex items-end justify-between gap-6">

          {/* Left — avatar + name + bio */}
          <div className="flex min-w-0 items-end gap-5">
            {/* Avatar */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-black/40 md:h-28 md:w-28">
              {avatar ? (
                <Image src={avatar} alt={displayName} fill className="object-cover" sizes="112px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-purple">
                  <span className="font-outfit text-2xl font-semibold text-white">
                    {nameInitials(displayName)}
                  </span>
                </div>
              )}
            </div>

            {/* Name row + bio */}
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
                  aria-label="Share profile"
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

          {/* Right — stats */}
          <div className="hidden shrink-0 items-center gap-5 pb-1 md:flex lg:gap-8">
            <StatItem value={stats.totalFilms} label={t.profile.films} />
            <div className="h-8 w-px bg-white/20" />
            <StatItem value={stats.thisYear}   label={t.profile.thisYear} />
            <div className="h-8 w-px bg-white/20" />
            <StatItem value={stats.following}  label={t.profile.following} />
            <div className="h-8 w-px bg-white/20" />
            <StatItem value={stats.followers}  label={t.profile.followers} />
          </div>

        </div>

        {/* Stats row on mobile (below avatar row) */}
        <div className="mt-3 flex items-center gap-5 md:hidden">
          <StatItem value={stats.totalFilms} label={t.profile.films} />
          <div className="h-6 w-px bg-white/20" />
          <StatItem value={stats.thisYear}   label={t.profile.thisYear} />
          <div className="h-6 w-px bg-white/20" />
          <StatItem value={stats.following}  label={t.profile.following} />
          <div className="h-6 w-px bg-white/20" />
          <StatItem value={stats.followers}  label={t.profile.followers} />
        </div>
      </div>
    </section>
  )
}
