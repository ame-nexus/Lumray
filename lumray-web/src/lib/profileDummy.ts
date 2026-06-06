import type { ProfileHeaderProps } from '@/components/profile/ProfileHeader'
import type { FavoritesRowProps } from '@/components/profile/FavoritesRow'
import type { RecentDiaryRowProps } from '@/components/profile/RecentDiaryRow'
import type { RecentReviewsListProps } from '@/components/profile/RecentReviewsList'
import type { AvgRatingCardProps } from '@/components/profile/AvgRatingCard'
import type { RecentActivityCardProps } from '@/components/profile/RecentActivityCard'
import type { WatchStreakCardProps } from '@/components/profile/WatchStreakCard'
import type { TasteBadgesCardProps } from '@/components/profile/TasteBadgesCard'
import type { DiaryEntryData } from '@/components/profile/DiaryEntryRow'
import type { DiaryStatsCardProps } from '@/components/profile/DiaryStatsCard'

export const DUMMY_PROFILE_HEADER: ProfileHeaderProps = {
  username: 'User_Name',
  name: 'User_Name',
  bio: 'Cinema is the art of the real made unreal. Lover of slow cinema, horror, and anything by Tarkovsky or Ari Aster. Always watching.',
  avatar: 'https://i.pravatar.cc/300?u=lumray-user',
  coverImage: 'https://image.tmdb.org/t/p/w1280/6Lw54zxmEwBAspSKvMtWF1W2HAW.jpg',
  memberSince: '2024-03-15T00:00:00.000Z',
  isOwnProfile: true,
  stats: {
    totalFilms: 254,
    thisYear: 29,
    following: 8,
    followers: 9,
  },
}

export const DUMMY_FAVORITES: FavoritesRowProps['movies'] = [
  { id: '502033', title: 'Sound of Metal', posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg' },
  { id: '129', title: 'A Silent Voice', posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg' },
  { id: '334541', title: 'Manchester by the Sea', posterPath: '/6JgSiYp7QoaUlmefY2aT7fiAe0H.jpg' },
  { id: '10315', title: 'Fantastic Mr. Fox', posterPath: '/8Vt6mWEReuy4OfC9ljwC3Jzp9XX.jpg' },
]

export const DUMMY_RECENT_DIARY: RecentDiaryRowProps['entries'] = [
  {
    id: 'd1',
    watchedAt: '2025-05-10',
    rating: 5,
    movie: { id: '1104167', title: 'Minari', posterPath: '/v9DHSqdT0NqQ6j0D7V1X1qX1qX1q.jpg' },
  },
  {
    id: 'd2',
    watchedAt: '2025-05-08',
    rating: 4,
    movie: { id: '77', title: 'Memento', posterPath: '/yuNs09hUQf0Sb2Mf3L0XA6tGSc0.jpg' },
  },
  {
    id: 'd3',
    watchedAt: '2025-05-05',
    rating: 5,
    movie: { id: '1241983', title: 'No Other Choice', posterPath: '/8XfKqXqXqXqXqXqXqXqXqXqXqX.jpg' },
  },
  {
    id: 'd4',
    watchedAt: '2025-05-01',
    rating: 5,
    movie: { id: '27205', title: 'Inception', posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },
  },
]

export const DUMMY_RECENT_REVIEWS: RecentReviewsListProps['reviews'] = [
  {
    id: 'r1',
    movie: {
      id: '965150',
      title: 'Aftersun',
      posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg',
      releaseDate: '2022-10-21',
    },
    content:
      'There is a haunting, rhythmic quality to this film that most modern cinema seems to have lost in the edit. Every frame of Aftersun feels like a memory you are afraid to lose.',
    rating: 5,
    createdAt: '2025-05-02',
    _count: { likes: 41, comments: 11 },
    isRewatch: false,
  },
  {
    id: 'r2',
    movie: {
      id: '965150',
      title: 'Aftersun',
      posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg',
      releaseDate: '2022-10-21',
    },
    content:
      'Charlotte Wells captures the gap between what we remember and what was really there. The dance floor scene destroyed me.',
    rating: 5,
    createdAt: '2025-04-14',
    _count: { likes: 28, comments: 5 },
    isRewatch: true,
  },
  {
    id: 'r3',
    movie: {
      id: '965150',
      title: 'Aftersun',
      posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg',
      releaseDate: '2022-10-21',
    },
    content:
      'Quiet, devastating, and beautifully acted. Paul Mescal and Frankie Corio are incredible together.',
    rating: 4,
    createdAt: '2025-03-03',
    _count: { likes: 19, comments: 3 },
  },
]

export const DUMMY_AVG_RATING: AvgRatingCardProps = {
  average: 4.2,
  totalRatings: 254,
  distribution: [12, 18, 45, 89, 90],
}

export const DUMMY_RECENT_ACTIVITY: RecentActivityCardProps['items'] = [
  {
    id: 'a1',
    type: 'logged',
    text: 'Logged Aftersun and gave it 5 stars',
    createdAt: '3 hours ago',
  },
  {
    id: 'a2',
    type: 'reviewed',
    text: 'Wrote a review for Manchester by the Sea',
    createdAt: '1 day ago',
  },
  {
    id: 'a3',
    type: 'added',
    text: 'Added Inception to your watchlist',
    createdAt: '2 days ago',
  },
  {
    id: 'a4',
    type: 'followed',
    text: 'Started following cinephile_omar',
    createdAt: '4 days ago',
  },
]

export const DUMMY_WATCH_STREAK: WatchStreakCardProps = {
  currentStreak: 12,
  personalBest: 47,
  activeDayIndices: [0, 1, 2, 4, 5],
}

export const DUMMY_TASTE_BADGES: TasteBadgesCardProps['badges'] = [
  { id: 'b1', label: 'Drama King', emoji: '🎭', description: '50 dramas watched' },
  { id: 'b2', label: 'On A Roll', emoji: '🔥', description: '12 day streak' },
  { id: 'b3', label: 'Horror Fiend', emoji: '👻', description: '30 horrors watched' },
  { id: 'b4', label: 'Critic', emoji: '✍️', description: '100 reviews written' },
]

export const DUMMY_DIARY_ENTRIES: DiaryEntryData[] = [
  {
    id: 'e1',
    watchedAt: '2025-05-12T00:00:00.000Z',
    isRewatch: true,
    rating: 5,
    movie: {
      id: '334541',
      title: 'Manchester by the sea',
      releaseDate: '2016-11-18',
      posterPath: '/6JgSiYp7QoaUlmefY2aT7fiAe0H.jpg',
    },
  },
  {
    id: 'e2',
    watchedAt: '2025-05-10T00:00:00.000Z',
    isRewatch: false,
    rating: 4,
    movie: {
      id: '27205',
      title: 'Inception',
      releaseDate: '2010-07-16',
      posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    },
  },
  {
    id: 'e3',
    watchedAt: '2025-05-08T00:00:00.000Z',
    isRewatch: false,
    rating: 5,
    movie: {
      id: '965150',
      title: 'Aftersun',
      releaseDate: '2022-10-21',
      posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg',
    },
  },
  {
    id: 'e4',
    watchedAt: '2025-04-28T00:00:00.000Z',
    isRewatch: true,
    rating: 5,
    movie: {
      id: '680',
      title: 'Pulp Fiction',
      releaseDate: '1994-10-14',
      posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    },
  },
  {
    id: 'e5',
    watchedAt: '2025-04-15T00:00:00.000Z',
    isRewatch: false,
    rating: 4,
    movie: {
      id: '157336',
      title: 'Interstellar',
      releaseDate: '2014-11-07',
      posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    },
  },
  {
    id: 'e6',
    watchedAt: '2025-04-02T00:00:00.000Z',
    isRewatch: false,
    rating: 5,
    movie: {
      id: '129',
      title: 'Spirited Away',
      releaseDate: '2001-07-20',
      posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg',
    },
  },
]

export const DUMMY_DIARY_STATS: DiaryStatsCardProps = {
  totalFilms: 244,
  thisYear: 29,
  thisMonth: 12,
  rewatches: 34,
  firstWatches: 210,
  avgPerMonth: 7.4,
}

export const DUMMY_PROFILE_FILMS = [
  { id: 334541, title: 'Manchester by the Sea', posterPath: '/6JgSiYp7QoaUlmefY2aT7fiAe0H.jpg', year: 2016 },
  { id: 1241983, title: 'No Other Choice', posterPath: '/8XfKqXqXqXqXqXqXqXqXqXqXqX.jpg', year: 2024 },
  { id: 129, title: 'A Silent Voice', posterPath: '/39wmItIWsg5sZMyWYCLiNmJ7hwM.jpg', year: 2016 },
  { id: 965150, title: 'Aftersun', posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg', year: 2022 },
  { id: 27205, title: 'Inception', posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', year: 2010 },
  { id: 157336, title: 'Interstellar', posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', year: 2014 },
  { id: 10315, title: 'Fantastic Mr. Fox', posterPath: '/8Vt6mWEReuy4OfC9ljwC3Jzp9XX.jpg', year: 2009 },
  { id: 2449, title: 'Lilya 4-ever', posterPath: '/8YZKuT42p3ZiQ6jaZGBv5PX8b2n.jpg', year: 2002 },
  { id: 77, title: 'Memento', posterPath: '/yuNs09hUQf0Sb2Mf3L0XA6tGSc0.jpg', year: 2000 },
  { id: 1104167, title: 'Minari', posterPath: '/v9DHSqdT0NqQ6j0D7V1X1qX1qX1q.jpg', year: 2020 },
  { id: 502033, title: 'Sound of Metal', posterPath: '/4nbsao3Iar0G2xV6sVk6seG9SMS.jpg', year: 2019 },
  { id: 641, title: 'Requiem for a Dream', posterPath: '/5ZWgHTxGWDVChtOLTCZH7dMiw9.jpg', year: 2000 },
  { id: 872585, title: 'Oppenheimer', posterPath: '/8Gxv8gSFCU0XGDykEGv7zR1nGlL.jpg', year: 2023 },
  { id: 680, title: 'Pulp Fiction', posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', year: 1994 },
  { id: 155, title: 'The Dark Knight', posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', year: 2008 },
  { id: 238, title: 'The Godfather', posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', year: 1972 },
  { id: 13, title: 'Forrest Gump', posterPath: '/arw2vcBveWOVZ6oa6TEq6NAsWzf.jpg', year: 1994 },
  { id: 550, title: 'Fight Club', posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', year: 1999 },
]
