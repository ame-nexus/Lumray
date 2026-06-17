import FavoritesRow from '@/components/profile/FavoritesRow'
import RecentDiaryRow from '@/components/profile/RecentDiaryRow'
import RecentReviewsList from '@/components/profile/RecentReviewsList'
import MovieRating from '@/components/movie/MovieRating'
import RecentActivityCard from '@/components/profile/RecentActivityCard'
import WatchStreakCard from '@/components/profile/WatchStreakCard'
import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'

const API = process.env.NEXT_PUBLIC_API_URL

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return (await res.json()).data ?? null
  } catch { return null }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const [diary, reviews, favourites, stats, activity] = await Promise.all([
    fetchJson<RawDiaryEntry[]>(`${API}/api/users/${username}/diary?limit=4`),
    fetchJson<RawReview[]>(`${API}/api/users/${username}/reviews?limit=5`),
    fetchJson<{ id: string; tmdbId: number; title: string; posterPath: string | null }[]>(`${API}/api/users/${username}/favourites?limit=4`),
    fetchJson<StatsData>(`${API}/api/users/${username}/stats`),
    fetchJson<ActivityItem[]>(`${API}/api/users/${username}/activity`),
  ])

  const diaryForRow = (diary ?? []).map((e) => ({
    id: e.id,
    watchedAt: e.watchedAt,
    rating: e.rating,
    movie: { id: String(e.movie.tmdbId), title: e.movie.title, posterPath: e.movie.posterPath },
  }))

  const reviewsForList = (reviews ?? []).map((r) => ({
    id: r.id,
    content: r.content,
    rating: r.rating,
    createdAt: r.createdAt,
    _count: r._count,
    movie: {
      id: String(r.movie.tmdbId),
      title: r.movie.title,
      posterPath: r.movie.posterPath,
      releaseDate: r.movie.releaseDate,
    },
  }))

  const favMovies = (favourites ?? []).map((f) => ({ id: String(f.tmdbId), title: f.title, posterPath: f.posterPath }))

  const ratingData     = stats?.rating ?? { average: 0, totalRatings: 0, distribution: [0, 0, 0, 0, 0] }
  const streakProps    = stats?.streak ?? { currentStreak: 0, personalBest: 0, activeDayIndices: [] }
  const activityItems  = (activity ?? []).map((a) => ({ ...a, createdAt: formatRelative(a.createdAt) }))

  const ratingDistribution = ratingData.distribution.map((count, i) => ({
    stars: (i + 1) as 1 | 2 | 3 | 4 | 5,
    count,
  }))

  return (
    <ProfileTwoColumn
      main={
        <>
          <FavoritesRow movies={favMovies} />
          <RecentDiaryRow username={username} entries={diaryForRow} />
          <RecentReviewsList username={username} reviews={reviewsForList} />
        </>
      }
      sidebar={
        <>
          <MovieRating
            average={ratingData.average}
            totalCount={ratingData.totalRatings}
            distribution={ratingDistribution}
          />
          <RecentActivityCard items={activityItems} />
          <WatchStreakCard {...streakProps} />
        </>
      }
    />
  )
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

interface RawDiaryEntry {
  id: string
  watchedAt: string
  rating: number | null
  movie: { id: string; tmdbId: number; title: string; posterPath: string | null }
}

interface RawReview {
  id: string
  content: string
  rating: number | null
  createdAt: string
  _count: { likes: number; comments: number }
  movie: { id: string; tmdbId: number; title: string; posterPath: string | null; releaseDate: string | null }
}

interface StatsData {
  rating:  { average: number; totalRatings: number; distribution: number[] }
  diary:   { totalFilms: number; thisYear: number; thisMonth: number; rewatches: number; firstWatches: number; avgPerMonth: number }
  streak:  { currentStreak: number; personalBest: number; activeDayIndices: number[] }
}

interface ActivityItem {
  id: string
  type: 'logged' | 'reviewed' | 'added' | 'followed'
  text: string
  createdAt: string
}
