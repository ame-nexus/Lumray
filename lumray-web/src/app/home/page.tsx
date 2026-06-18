'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import MovieRow, { type MovieRowMovie } from '@/components/films/MovieRow'
import PostCard, { type PostCardData } from '@/components/community/PostCard'
import CommunityReview, { COMMUNITY_REVIEW_DUMMY, type CommunityReviewItem } from '@/components/community/CommunityReview'
import GenreCard, { GENRE_CARD_DUMMY, type GenreCardProps } from '@/components/films/GenreCard'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'
import { useHydrateFilmStatuses } from '@/hooks/useFilmStatuses'

// ── API shapes ───────────────────────────────────────────────────────────

type ApiMovie = {
  id?: string
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string | null
  voteAverage?: number
  voteCount?: number
}

type ApiReview = {
  id: string
  content: string
  rating: number | null
  likeCount: number
  user: { id: string; username: string; avatar: string | null }
  movie: { tmdbId: number; title: string; posterPath: string | null }
}

type ApiGenre = {
  tmdbId: number
  name: string
  posters: string[]
}

type ApiPost = {
  id: string
  content: string
  tags: string[]
  createdAt: string
  isLiked: boolean
  user: { username: string; avatar: string | null }
  movie: { tmdbId: number; title: string; posterPath: string | null; releaseDate: string | null } | null
  _count: { likes: number; comments: number }
}

// ── Genre gradient map (design decisions — not in DB) ────────────────────

const GENRE_GRADIENTS: Record<string, { from: string; to: string }> = {
  'Drama':            { from: 'rgba(26,16,53,0.85)',  to: 'rgba(113,78,228,0.9)' },
  'Horror':           { from: 'rgba(13,0,0,0.85)',    to: 'rgba(127,29,29,0.9)' },
  'Science Fiction':  { from: 'rgba(5,13,26,0.85)',   to: 'rgba(15,61,110,0.9)' },
  'Animation':        { from: 'rgba(13,26,10,0.85)',  to: 'rgba(45,107,26,0.9)' },
  'Thriller':         { from: 'rgba(26,10,5,0.85)',   to: 'rgba(122,46,8,0.9)' },
  'Romance':          { from: 'rgba(26,13,26,0.85)',  to: 'rgba(122,32,128,0.9)' },
  'Crime':            { from: 'rgba(10,10,10,0.85)',  to: 'rgba(50,50,60,0.9)' },
  'Comedy':           { from: 'rgba(26,20,5,0.85)',   to: 'rgba(133,100,10,0.9)' },
  'Action':           { from: 'rgba(26,5,5,0.85)',    to: 'rgba(150,30,30,0.9)' },
  'Adventure':        { from: 'rgba(5,20,26,0.85)',   to: 'rgba(20,90,100,0.9)' },
  'Fantasy':          { from: 'rgba(10,5,26,0.85)',   to: 'rgba(60,20,110,0.9)' },
  'Music':            { from: 'rgba(5,5,26,0.85)',    to: 'rgba(30,20,100,0.9)' },
  'Documentary':      { from: 'rgba(10,15,10,0.85)',  to: 'rgba(40,60,40,0.9)' },
  'History':          { from: 'rgba(20,15,5,0.85)',   to: 'rgba(80,60,20,0.9)' },
  'War':              { from: 'rgba(15,10,5,0.85)',   to: 'rgba(60,40,20,0.9)' },
  'Western':          { from: 'rgba(20,10,5,0.85)',   to: 'rgba(80,40,20,0.9)' },
  'Family':           { from: 'rgba(5,20,5,0.85)',    to: 'rgba(30,100,50,0.9)' },
  'Mystery':          { from: 'rgba(10,10,20,0.85)',  to: 'rgba(40,40,80,0.9)' },
}
const DEFAULT_GRADIENT = { from: 'rgba(20,20,30,0.85)', to: 'rgba(60,50,80,0.9)' }

// ── Adapters ─────────────────────────────────────────────────────────────

function toGenreCard(g: ApiGenre): GenreCardProps {
  const grad = GENRE_GRADIENTS[g.name] ?? DEFAULT_GRADIENT
  return {
    name: g.name,
    gradientFrom: grad.from,
    gradientTo:   grad.to,
    posters: g.posters.map(p => `https://image.tmdb.org/t/p/w300${p}`),
  }
}

function toRowMovie(m: ApiMovie): MovieRowMovie {
  return {
    id: m.tmdbId,
    dbId: m.id,
    title: m.title,
    posterPath: m.posterPath ?? '',
    year: m.releaseDate?.slice(0, 4),
    rating: m.voteAverage != null ? +(m.voteAverage / 2).toFixed(1) : undefined,
    ratingCount: m.voteCount,
  }
}

function toReviewItem(r: ApiReview): CommunityReviewItem | null {
  if (!r.movie.posterPath) return null
  return {
    id: r.id,
    isLiked: false,
    content: r.content,
    rating: Math.round(r.rating ?? 0),
    user: {
      id: r.user.id,
      username: r.user.username,
      avatar: r.user.avatar ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(r.user.username)}`,
    },
    movie: { tmdbId: r.movie.tmdbId, title: r.movie.title, posterPath: r.movie.posterPath },
    likeCount: r.likeCount,
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function toPostCard(p: ApiPost): PostCardData {
  const year = p.movie?.releaseDate ? parseInt(p.movie.releaseDate.slice(0, 4)) : undefined
  return {
    id: p.id,
    isLiked: p.isLiked,
    user: { username: p.user.username, avatar: p.user.avatar ?? undefined },
    content: p.content,
    tag: p.tags[0] ?? 'General',
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    timestamp: timeAgo(p.createdAt),
    movie: p.movie && year
      ? { title: p.movie.title, year, posterPath: p.movie.posterPath ?? undefined }
      : undefined,
  }
}

// ── Skeleton components ──────────────────────────────────────────────────

function MovieRowSkeleton({ title }: { title: string }) {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-lg font-bold text-text lg:text-xl">{title}</h2>
      </div>
      <div className="hidden lg:grid grid-cols-6 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
      <div className="flex gap-3 lg:hidden overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-2/3 w-[42vw] shrink-0 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    </section>
  )
}

function ReviewsSkeleton() {
  return (
    <section className="w-full">
      <h2 className="mb-4 font-outfit text-lg font-bold text-text lg:text-xl">Community Recommendation</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-56 md:h-64 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </section>
  )
}

function GenresSkeleton({ title }: { title: string }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="font-outfit text-lg font-bold text-text lg:text-xl">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-35 md:h-40 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </section>
  )
}

function PostsSkeleton({ title }: { title: string }) {
  return (
    <section>
      <h2 className="font-outfit text-lg font-bold text-text lg:text-xl mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-text/10 bg-surface p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 shrink-0 rounded-full bg-surface-2" />
              <div className="h-3 w-28 rounded bg-surface-2" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-full rounded bg-surface-2" />
              <div className="h-3 w-4/5 rounded bg-surface-2" />
              <div className="h-3 w-3/5 rounded bg-surface-2" />
            </div>
            <div className="mt-auto flex items-center gap-4 border-t border-text/10 pt-3">
              <div className="h-3 w-10 rounded bg-surface-2" />
              <div className="h-3 w-10 rounded bg-surface-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const user = useAuthStore(s => s.user)
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  const [popularMovies,     setPopularMovies]    = useState<MovieRowMovie[] | null>(null)
  const [topRatedMovies,    setTopRatedMovies]   = useState<MovieRowMovie[] | null>(null)
  const [friendsMovies,     setFriendsMovies]    = useState<MovieRowMovie[] | null>(null)
  const [recommendedMovies, setRecommended]      = useState<MovieRowMovie[] | null>(null)
  const [featuredReviews,   setFeaturedReviews]  = useState<CommunityReviewItem[] | null>(null)
  const [posts,             setPosts]            = useState<PostCardData[] | null>(null)
  const [genreCards,        setGenreCards]       = useState<GenreCardProps[] | null>(null)

  // Public data — each fetch is independent so one failure never blocks the others
  useEffect(() => {
    Promise.allSettled([
      api.get('/api/movies/browse', { params: { sort: 'popular',   limit: 18 } }),
      api.get('/api/movies/browse', { params: { sort: 'top-rated', limit: 18 } }),
      api.get('/api/reviews/featured'),
      api.get('/api/posts', { params: { limit: 4 } }),
      api.get('/api/movies/genre-previews'),
    ]).then(([popularRes, topRatedRes, reviewsRes, postsRes, genreRes]) => {
      if (popularRes.status  === 'fulfilled')
        setPopularMovies((popularRes.value.data.data.movies as ApiMovie[]).map(toRowMovie))
      if (topRatedRes.status === 'fulfilled')
        setTopRatedMovies((topRatedRes.value.data.data.movies as ApiMovie[]).map(toRowMovie))
      if (reviewsRes.status  === 'fulfilled')
        setFeaturedReviews(
          (reviewsRes.value.data.data as ApiReview[])
            .map(toReviewItem)
            .filter((r): r is CommunityReviewItem => r !== null)
        )
      else
        setFeaturedReviews([])
      if (postsRes.status === 'fulfilled')
        setPosts((postsRes.value.data.data.posts as ApiPost[]).map(toPostCard))
      else
        setPosts([])
      if (genreRes.status === 'fulfilled' && (genreRes.value.data.data as ApiGenre[]).length > 0)
        setGenreCards((genreRes.value.data.data as ApiGenre[]).map(toGenreCard))
      else
        setGenreCards(GENRE_CARD_DUMMY)
    })
  }, [])

  // User-specific data — re-fetch on login state change
  useEffect(() => {
    if (!user) {
      setFriendsMovies(null)
      setRecommended(null)
      return
    }
    Promise.all([
      api.get('/api/movies/friends-watching'),
      api.get('/api/movies/recommended'),
    ]).then(([friendsRes, recRes]) => {
      setFriendsMovies((friendsRes.data.data as ApiMovie[]).map(toRowMovie))
      setRecommended((recRes.data.data   as ApiMovie[]).map(toRowMovie))
    }).catch(() => {})
  }, [user])

  // Reflect logged / watchlist / favourite state on every poster row
  useHydrateFilmStatuses([
    ...(popularMovies     ?? []),
    ...(topRatedMovies    ?? []),
    ...(friendsMovies     ?? []),
    ...(recommendedMovies ?? []),
  ].map(m => m.dbId))

  return (
    <main className="px-6 md:px-12 xl:px-60 py-10 flex flex-col gap-10">

      {popularMovies !== null
        ? <MovieRow title={t.home.popular} movies={popularMovies} />
        : <MovieRowSkeleton title={t.home.popular} />
      }

      {topRatedMovies !== null
        ? <MovieRow title={t.home.topRated} movies={topRatedMovies} />
        : <MovieRowSkeleton title={t.home.topRated} />
      }

      {user && friendsMovies === null && (
        <MovieRowSkeleton title={t.home.popularFriends} />
      )}
      {user && friendsMovies !== null && friendsMovies.length > 0 && (
        <MovieRow title={t.home.popularFriends} movies={friendsMovies} />
      )}

      {user && recommendedMovies === null && (
        <MovieRowSkeleton title={t.home.recommended} />
      )}
      {user && recommendedMovies !== null && recommendedMovies.length > 0 && (
        <MovieRow title={t.home.recommended} movies={recommendedMovies} />
      )}

      {/* Genres */}
      {genreCards !== null ? (
        <section>
          <div className="mb-6">
            <h2 className="font-outfit text-lg font-bold text-text lg:text-xl">{t.home.genres}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {genreCards.map((g) => <GenreCard key={g.name} {...g} />)}
          </div>
        </section>
      ) : (
        <GenresSkeleton title={t.home.genres} />
      )}

      {/* Featured reviews */}
      {featuredReviews !== null
        ? featuredReviews.length > 0 && <CommunityReview reviews={featuredReviews} />
        : <ReviewsSkeleton />
      }

      {/* Community posts — skeleton while loading, hidden entirely when empty */}
      {posts === null
        ? <PostsSkeleton title={t.home.communityPosts} />
        : posts.length > 0 && (
          <section>
            <h2 className="font-outfit text-lg font-bold text-text lg:text-xl mb-4">{t.home.communityPosts}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post, i) => <PostCard key={i} post={post} />)}
            </div>
            {!user && (
              <div className="mt-6 rounded-xl border border-text/10 bg-surface p-6 text-center">
                <p className="font-roboto text-text-muted mb-3">{t.home.signInPrompt}</p>
                <Link href="/signup" className="inline-block bg-purple text-white font-medium text-sm px-5 py-2 rounded-full hover:bg-purple-deep transition-colors">
                  {t.home.getStarted}
                </Link>
              </div>
            )}
          </section>
        )
      }

    </main>
  )
}
