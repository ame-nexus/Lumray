import DiaryTabContent from '@/components/profile/DiaryTabContent'
import type { DiaryEntryData } from '@/components/profile/DiaryEntryRow'
import type { DiaryStatsCardProps } from '@/components/profile/DiaryStatsCard'

const API = process.env.NEXT_PUBLIC_API_URL

async function getDiaryEntries(username: string): Promise<DiaryEntryData[]> {
  try {
    const res = await fetch(`${API}/api/users/${username}/diary`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const raw: RawEntry[] = (await res.json()).data ?? []
    return raw.map((e) => ({
      id: e.id,
      watchedAt: e.watchedAt,
      rating: e.rating,
      isRewatch: e.isRewatch,
      movie: {
        id: String(e.movie.tmdbId),
        title: e.movie.title,
        releaseDate: e.movie.releaseDate,
        posterPath: e.movie.posterPath,
      },
    }))
  } catch { return [] }
}

async function getStats(username: string): Promise<DiaryStatsCardProps> {
  const fallback: DiaryStatsCardProps = { totalFilms: 0, thisYear: 0, thisMonth: 0, rewatches: 0, firstWatches: 0, avgPerMonth: 0 }
  try {
    const res = await fetch(`${API}/api/users/${username}/stats`, { next: { revalidate: 60 } })
    if (!res.ok) return fallback
    const stats = (await res.json()).data?.diary
    return stats ?? fallback
  } catch { return fallback }
}

export default async function ProfileDiaryPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const [entries, stats] = await Promise.all([getDiaryEntries(username), getStats(username)])
  return <DiaryTabContent entries={entries} stats={stats} username={username} />
}

interface RawEntry {
  id: string
  watchedAt: string
  rating: number | null
  isRewatch: boolean
  movie: { id: string; tmdbId: number; title: string; releaseDate: string | null; posterPath: string | null }
}
