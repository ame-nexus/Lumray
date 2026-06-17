'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface ProfileTabsProps {
  username: string
}

type TabKey = 'profile' | 'films' | 'diary' | 'reviews' | 'lists' | 'stats'

function resolveActiveTab(pathname: string, username: string): TabKey {
  const base = `/profile/${username}`
  if (pathname === base) return 'profile'
  if (pathname.startsWith(`${base}/films`))   return 'films'
  if (pathname.startsWith(`${base}/diary`))   return 'diary'
  if (pathname.startsWith(`${base}/reviews`)) return 'reviews'
  if (pathname.startsWith(`${base}/lists`))   return 'lists'
  if (pathname.startsWith(`${base}/stats`))   return 'stats'
  return 'profile'
}

export default function ProfileTabs({ username }: ProfileTabsProps) {
  const pathname = usePathname()
  const lang     = useLanguageStore(s => s.lang)
  const t        = useT(lang)
  const current  = resolveActiveTab(pathname, username)

  const TABS: { key: TabKey; label: string; suffix: string }[] = [
    { key: 'profile',  label: t.profile.tabs.profile,  suffix: '' },
    { key: 'films',    label: t.profile.tabs.films,    suffix: '/films' },
    { key: 'diary',    label: t.profile.tabs.diary,    suffix: '/diary' },
    { key: 'reviews',  label: t.profile.tabs.reviews,  suffix: '/reviews' },
    { key: 'lists',    label: t.profile.tabs.lists,    suffix: '/lists' },
    { key: 'stats',    label: t.profile.tabs.stats,    suffix: '/stats' },
  ]

  return (
    <nav className="border-b border-text/10 bg-bg px-6 md:px-12 xl:px-60">
      <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(({ key, label, suffix }) => (
          <Link
            key={key}
            href={`/profile/${username}${suffix}`}
            className={[
              'relative shrink-0 px-4 py-4 font-roboto text-sm transition-colors',
              current === key
                ? 'font-semibold text-text'
                : 'text-text-muted hover:text-text-dim',
            ].join(' ')}
          >
            {label}
            {current === key && (
              <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-purple-light" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  )
}
