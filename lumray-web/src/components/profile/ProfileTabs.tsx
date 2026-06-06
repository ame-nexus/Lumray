'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface ProfileTabsProps {
  username: string
  activeTab?: 'profile' | 'films' | 'diary' | 'reviews' | 'lists' | 'stats'
}

const TABS = [
  { key: 'profile' as const, label: 'Profile', suffix: '' },
  { key: 'films' as const, label: 'Films', suffix: '/films' },
  { key: 'diary' as const, label: 'Diary', suffix: '/diary' },
  { key: 'reviews' as const, label: 'Reviews', suffix: '/reviews' },
  { key: 'lists' as const, label: 'Lists', suffix: '/lists' },
  { key: 'stats' as const, label: 'Stats', suffix: '/stats' },
]

function resolveActiveTab(pathname: string, username: string): ProfileTabsProps['activeTab'] {
  const base = `/profile/${username}`
  if (pathname === base) return 'profile'
  if (pathname.startsWith(`${base}/films`)) return 'films'
  if (pathname.startsWith(`${base}/diary`)) return 'diary'
  if (pathname.startsWith(`${base}/reviews`)) return 'reviews'
  if (pathname.startsWith(`${base}/lists`)) return 'lists'
  if (pathname.startsWith(`${base}/stats`)) return 'stats'
  return 'profile'
}

export default function ProfileTabs({ username, activeTab }: ProfileTabsProps) {
  const pathname = usePathname()
  const current = activeTab ?? resolveActiveTab(pathname, username)

  return (
    <nav className="border-b border-text/10 px-6 md:px-12 xl:px-60">
      <div className="flex gap-6 overflow-x-auto scrollbar-none">
        {TABS.map(({ key, label, suffix }) => {
          const href = `/profile/${username}${suffix}`
          const isActive = current === key

          return (
            <Link
              key={key}
              href={href}
              className={[
                'shrink-0 border-b-2 pb-3 font-outfit text-sm transition-colors',
                isActive
                  ? 'border-purple-light font-semibold text-text'
                  : 'border-transparent text-text-muted hover:text-text-dim',
              ].join(' ')}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
