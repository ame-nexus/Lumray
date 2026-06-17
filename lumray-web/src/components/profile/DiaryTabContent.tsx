'use client'

import { useMemo, useState } from 'react'
import DiaryToolbar from '@/components/profile/DiaryToolbar'
import DiaryMonthGroup from '@/components/profile/DiaryMonthGroup'
import DiaryStatsCard from '@/components/profile/DiaryStatsCard'
import DiaryPagination from '@/components/profile/DiaryPagination'
import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'
import type { DiaryEntryData } from '@/components/profile/DiaryEntryRow'
import type { DiaryStatsCardProps } from '@/components/profile/DiaryStatsCard'
import { useAuthStore } from '@/store/auth.store'

interface DiaryTabContentProps {
  entries: DiaryEntryData[]
  stats: DiaryStatsCardProps
  username: string
}

const PAGE_SIZE = 10

function monthKey(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Unknown'
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function groupByMonth(entries: DiaryEntryData[]): { month: string; entries: DiaryEntryData[] }[] {
  const map = new Map<string, DiaryEntryData[]>()

  for (const entry of entries) {
    const key = monthKey(entry.watchedAt)
    const list = map.get(key) ?? []
    list.push(entry)
    map.set(key, list)
  }

  return Array.from(map.entries()).map(([month, monthEntries]) => ({
    month,
    entries: monthEntries,
  }))
}

export default function DiaryTabContent({ entries: initialEntries, stats, username }: DiaryTabContentProps) {
  const currentUser = useAuthStore(s => s.user)
  const isOwner = currentUser?.username === username

  const [entries, setEntries] = useState<DiaryEntryData[]>(initialEntries)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [page, setPage] = useState(1)

  const handleDelete = (id: string) => setEntries(prev => prev.filter(e => e.id !== id))
  const handleEdit = (updated: DiaryEntryData) => setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => e.movie.title.toLowerCase().includes(q))
  }, [entries, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const groups = groupByMonth(paged)

  return (
    <ProfileTwoColumn
      main={
        <>
          <DiaryToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            view={view}
            onViewChange={setView}
            onFilterOpen={() => {}}
          />

          <div className="mt-6">
            {groups.map((group) => (
              <DiaryMonthGroup
                key={group.month}
                month={group.month}
                entries={group.entries}
                view={view}
                isOwner={isOwner}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}

            {filtered.length === 0 && (
              <p className="py-12 text-center font-roboto text-sm text-text-muted">
                No diary entries found.
              </p>
            )}
          </div>

          {filtered.length > 0 && (
            <DiaryPagination
              hasPrev={safePage > 1}
              hasNext={safePage < pageCount}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
            />
          )}
        </>
      }
      sidebar={<DiaryStatsCard {...stats} />}
    />
  )
}
