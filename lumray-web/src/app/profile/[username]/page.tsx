import FavoritesRow from '@/components/profile/FavoritesRow'
import RecentDiaryRow from '@/components/profile/RecentDiaryRow'
import RecentReviewsList from '@/components/profile/RecentReviewsList'
import AvgRatingCard from '@/components/profile/AvgRatingCard'
import RecentActivityCard from '@/components/profile/RecentActivityCard'
import WatchStreakCard from '@/components/profile/WatchStreakCard'
import TasteBadgesCard from '@/components/profile/TasteBadgesCard'
import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'
import {
  DUMMY_AVG_RATING,
  DUMMY_FAVORITES,
  DUMMY_RECENT_ACTIVITY,
  DUMMY_RECENT_DIARY,
  DUMMY_RECENT_REVIEWS,
  DUMMY_TASTE_BADGES,
  DUMMY_WATCH_STREAK,
} from '@/lib/profileDummy'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  return (
    <ProfileTwoColumn
      main={
        <>
          <FavoritesRow movies={DUMMY_FAVORITES} />
          <RecentDiaryRow username={username} entries={DUMMY_RECENT_DIARY} />
          <RecentReviewsList username={username} reviews={DUMMY_RECENT_REVIEWS} />
        </>
      }
      sidebar={
        <>
          <AvgRatingCard {...DUMMY_AVG_RATING} />
          <RecentActivityCard items={DUMMY_RECENT_ACTIVITY} />
          <WatchStreakCard {...DUMMY_WATCH_STREAK} />
          <TasteBadgesCard badges={DUMMY_TASTE_BADGES} />
        </>
      }
    />
  )
}
