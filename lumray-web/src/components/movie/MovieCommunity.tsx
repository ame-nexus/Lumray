'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle } from 'lucide-react'
import ReviewCard, { type ReviewCardProps } from '@/components/movie/ReviewCard'
import api from '@/services/api'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export interface MovieCommunityProps {
  movieId: string
  tmdbId:  number
  reviews: ReviewCardProps[]
}

type Tab = 'reviews' | 'posts' | 'lists'

interface ApiReview {
  id: string
  content: string
  rating: number | null
  createdAt: string
  isLiked: boolean
  user: { id: string; username: string; avatar: string | null }
  _count: { likes: number; comments: number }
}

interface ApiPost {
  id: string
  content: string
  createdAt: string
  user: { username: string; avatar: string | null }
  _count: { likes: number; comments: number }
}

interface ApiList {
  id: string
  name: string
  user: { username: string; avatar: string | null }
  _count: { items: number }
  items: { movie: { posterPath: string | null } }[]
}

function usernameInitials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

function Avatar({ username, avatar }: { username: string; avatar: string | null }) {
  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-purple">
      {avatar ? (
        <Image src={avatar} alt={username} fill className="object-cover" sizes="32px" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
          {usernameInitials(username)}
        </span>
      )}
    </div>
  )
}

export default function MovieCommunity({ movieId, tmdbId }: MovieCommunityProps) {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  const [tab,          setTab]          = useState<Tab>('reviews')
  const [reviews,      setReviews]      = useState<ReviewCardProps[]>([])
  const [posts,        setPosts]        = useState<ApiPost[]>([])
  const [lists,        setLists]        = useState<ApiList[]>([])
  const [loading,      setLoading]      = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsFetched, setPostsFetched] = useState(false)
  const [listsLoading, setListsLoading] = useState(false)
  const [listsFetched, setListsFetched] = useState(false)

  const fetchReviews = useCallback(() => {
    setLoading(true)
    api.get(`/api/reviews?movieId=${movieId}`)
      .then(res => {
        const raw: ApiReview[] = res.data.data ?? []
        setReviews(raw.map(r => ({
          id:           r.id,
          user:         { id: r.user.id, username: r.user.username, avatar: r.user.avatar },
          rating:       r.rating,
          content:      r.content,
          likeCount:    r._count.likes,
          commentCount: r._count.comments,
          createdAt:    new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          isLiked:      r.isLiked,
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [movieId])

  const fetchPosts = useCallback(() => {
    setPostsLoading(true)
    api.get(`/api/posts?movieId=${movieId}&limit=3`)
      .then(res => setPosts(res.data.data?.posts ?? []))
      .catch(() => {})
      .finally(() => { setPostsLoading(false); setPostsFetched(true) })
  }, [movieId])

  const fetchLists = useCallback(() => {
    setListsLoading(true)
    api.get(`/api/lists/by-movie/${movieId}`)
      .then(res => setLists(res.data.data ?? []))
      .catch(() => {})
      .finally(() => { setListsLoading(false); setListsFetched(true) })
  }, [movieId])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  useEffect(() => {
    if (tab === 'posts' && !postsFetched) fetchPosts()
  }, [tab, postsFetched, fetchPosts])

  useEffect(() => {
    if (tab === 'lists' && !listsFetched) fetchLists()
  }, [tab, listsFetched, fetchLists])

  // Live refresh
  useEffect(() => {
    const match = (e: Event) => (e as CustomEvent).detail.movieId === movieId
    const onReview = (e: Event) => { if (match(e)) fetchReviews() }
    const onPost   = (e: Event) => { if (match(e)) fetchPosts() }
    const onList   = (e: Event) => { if (match(e)) fetchLists() }
    window.addEventListener('lumray:review-saved', onReview)
    window.addEventListener('lumray:post-saved',   onPost)
    window.addEventListener('lumray:list-saved',   onList)
    return () => {
      window.removeEventListener('lumray:review-saved', onReview)
      window.removeEventListener('lumray:post-saved',   onPost)
      window.removeEventListener('lumray:list-saved',   onList)
    }
  }, [movieId, fetchReviews, fetchPosts, fetchLists])

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-xl font-bold text-text">{t.movie.community}</h2>
        {tab === 'reviews' && (
          <Link href={`/films/${tmdbId}/reviews`} className="font-roboto text-sm text-purple-light underline">
            {t.movie.allReviews}
          </Link>
        )}
      </div>

      <div className="mb-4 flex gap-6 border-b border-text/10">
        {([
          { key: 'reviews', label: t.movie.reviews },
          { key: 'posts',   label: t.movie.posts   },
          { key: 'lists',   label: t.movie.lists   },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`pb-2 font-outfit text-sm font-medium transition-colors ${
              tab === key ? 'border-b-2 border-purple-light text-text' : 'text-text-muted hover:text-text-dim'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reviews */}
      {tab === 'reviews' && (
        loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />)}
          </div>
        ) : reviews.length === 0 ? (
          <p className="py-6 text-center font-roboto text-sm text-text-muted">
            {t.movie.noReviews}
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} {...review} onDeleted={fetchReviews} />
            ))}
          </div>
        )
      )}

      {/* Posts */}
      {tab === 'posts' && (
        postsLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />)}
          </div>
        ) : posts.length === 0 ? (
          <p className="py-6 text-center font-roboto text-sm text-text-muted">
            {t.movie.noPosts}
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} href={`/community/${post.id}`} className="block rounded-xl border border-text/10 bg-surface p-4 transition-colors hover:border-text/20 hover:bg-surface-2">
                <div className="flex items-center gap-2.5">
                  <Avatar username={post.user.username} avatar={post.user.avatar} />
                  <div>
                    <p className="font-outfit text-sm font-medium text-text">{post.user.username}</p>
                    <p className="font-roboto text-xs text-text-muted">
                      {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="mt-3 font-roboto text-sm leading-relaxed text-text">{post.content}</p>
                <div className="mt-4 flex items-center gap-3 font-roboto text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1"><Heart size={12} />{post._count.likes} {t.movie.likes}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle size={12} />{post._count.comments} {t.movie.comments}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {/* Lists */}
      {tab === 'lists' && (
        listsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />)}
          </div>
        ) : lists.length === 0 ? (
          <p className="py-6 text-center font-roboto text-sm text-text-muted">
            {t.movie.noLists}
          </p>
        ) : (
          <div className="space-y-3">
            {lists.map(list => (
              <Link
                key={list.id}
                href={`/profile/${list.user.username}/lists/${list.id}`}
                className="flex items-center gap-4 rounded-xl bg-surface p-3 transition-colors hover:bg-surface-2"
              >
                <div className="flex shrink-0 gap-0.5 overflow-hidden rounded-lg">
                  {Array.from({ length: 4 }, (_, i) => {
                    const poster = list.items[i]?.movie.posterPath
                    return poster ? (
                      <div key={i} className="relative h-14 w-9 shrink-0">
                        <Image src={`https://image.tmdb.org/t/p/w92${poster}`} alt="" fill className="object-cover" sizes="36px" />
                      </div>
                    ) : (
                      <div key={i} className="h-14 w-9 shrink-0 bg-surface-2" />
                    )
                  })}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-outfit text-sm font-semibold text-text">{list.name}</p>
                  <p className="font-roboto text-xs text-text-muted">
                    {list._count.items} {t.movie.films} · {t.movie.by} <span className="text-purple-light">{list.user.username}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </section>
  )
}
