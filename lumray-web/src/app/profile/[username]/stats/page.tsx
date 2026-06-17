import MovieRating from '@/components/movie/MovieRating'
import WatchStreakCard from '@/components/profile/WatchStreakCard'
import DiaryStatsCard from '@/components/profile/DiaryStatsCard'
import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'

const API = process.env.NEXT_PUBLIC_API_URL

interface StatsData {
  rating: { average: number; totalRatings: number; distribution: number[] }
  diary:  { totalFilms: number; thisYear: number; thisMonth: number; rewatches: number; firstWatches: number; avgPerMonth: number }
  streak: { currentStreak: number; personalBest: number; activeDayIndices: number[] }
}

async function getStats(username: string): Promise<StatsData | null> {
  try {
    const res = await fetch(`${API}/api/users/${username}/stats`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return (await res.json()).data ?? null
  } catch { return null }
}

export default async function ProfileStatsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const stats = await getStats(username)

  const rating  = stats?.rating  ?? { average: 0, totalRatings: 0, distribution: [0, 0, 0, 0, 0] }
  const diary   = stats?.diary   ?? { totalFilms: 0, thisYear: 0, thisMonth: 0, rewatches: 0, firstWatches: 0, avgPerMonth: 0 }
  const streak  = stats?.streak  ?? { currentStreak: 0, personalBest: 0, activeDayIndices: [] }

  // Convert flat distribution array [count1,count2,count3,count4,count5] → MovieRating shape
  const distribution = rating.distribution.map((count, i) => ({
    stars: (i + 1) as 1 | 2 | 3 | 4 | 5,
    count,
  }))

  return (
    <ProfileTwoColumn
      main={
        <div className="space-y-6">
          <h2 className="font-outfit text-lg font-semibold text-text">Stats</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MovieRating
              average={rating.average}
              totalCount={rating.totalRatings}
              distribution={distribution}
            />
            <WatchStreakCard {...streak} />
          </div>

          <DiaryStatsCard {...diary} />
        </div>
      }
    />
  )
}
