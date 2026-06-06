'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { nameInitials } from '@/lib/tmdbImage'

export interface ProfileHeaderProps {
  username: string
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
      <span className="font-outfit text-lg font-bold text-text md:text-xl">{value}</span>
      <span className="font-roboto text-xs text-text-muted">{label}</span>
    </div>
  )
}

export default function ProfileHeader({
  username,
  name,
  bio,
  avatar,
  coverImage,
  memberSince,
  isOwnProfile,
  stats,
}: ProfileHeaderProps) {
  const displayName = name ?? username

  return (
    <section className="relative">
      <div className="relative h-48 w-full overflow-hidden md:h-64 xl:h-72">
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
          <div className="h-full w-full bg-gradient-to-r from-bg-dark to-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
      </div>

      <div className="relative px-6 pb-6 md:px-12 xl:px-60">
        <div className="absolute -top-12 left-6 h-[72px] w-[72px] overflow-hidden rounded-full ring-4 ring-bg md:-top-14 md:left-12 md:h-24 md:w-24 xl:left-60">
          {avatar ? (
            <Image src={avatar} alt={displayName} fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-purple">
              <span className="font-outfit text-lg font-semibold text-white">
                {nameInitials(displayName)}
              </span>
            </div>
          )}
        </div>

        <div className="pt-10 md:pt-14">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 md:pl-28 xl:pl-32">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-outfit text-2xl font-bold text-text md:text-3xl">
                  {displayName}
                </h1>
                {isOwnProfile && (
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple px-3 py-1.5 font-roboto text-xs text-white transition-colors hover:bg-purple/90"
                  >
                    <Pencil size={12} />
                    Edit profile
                  </Link>
                )}
              </div>

              <p className="mt-1 font-roboto text-xs text-text-muted">
                Member since {memberSinceYear(memberSince)}
              </p>

              {bio && (
                <p className="mt-3 max-w-2xl font-roboto text-sm leading-relaxed text-text-dim">
                  {bio}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-10 lg:pt-2">
              <StatItem value={stats.totalFilms} label="Films" />
              <div className="hidden h-8 w-px bg-text/10 sm:block" />
              <StatItem value={stats.thisYear} label="This year" />
              <div className="hidden h-8 w-px bg-text/10 sm:block" />
              <StatItem value={stats.following} label="Following" />
              <div className="hidden h-8 w-px bg-text/10 sm:block" />
              <StatItem value={stats.followers} label="Followers" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
