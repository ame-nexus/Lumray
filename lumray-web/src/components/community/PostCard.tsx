'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'

export interface PostCardData {
  id: string
  user: { username: string; avatar?: string }
  movie?: { title: string; year: number; director?: string; rating?: number; posterPath?: string }
  content: string
  tag: string
  likeCount: number
  commentCount: number
  timestamp?: string
  isLiked: boolean
}

function posterUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w300${path}`
}

export default function PostCard({ post }: { post: PostCardData }) {
  const router    = useRouter()
  const user      = useAuthStore(s => s.user)
  const initials  = post.user.username.slice(0, 2).toUpperCase()
  const [liked,      setLiked]      = useState(post.isLiked)
  const [likeCount,  setLikeCount]  = useState(post.likeCount)

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/login'); return }
    const next = !liked
    setLiked(next)
    setLikeCount(c => c + (next ? 1 : -1))
    try {
      if (next) await api.post(`/api/posts/${post.id}/like`)
      else       await api.delete(`/api/posts/${post.id}/like`)
    } catch {
      setLiked(!next)
      setLikeCount(c => c + (next ? -1 : 1))
    }
  }

  return (
    <article className="rounded-xl border border-text/10 bg-surface flex flex-col">

      {/* Clickable content area → post detail */}
      <Link href={`/community/${post.id}`} className="flex flex-col gap-3 p-4 transition-colors hover:bg-white/2.5">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-purple flex items-center justify-center">
              {post.user.avatar
                ? <Image src={post.user.avatar} alt={post.user.username} fill className="object-cover" sizes="32px" />
                : <span className="font-roboto text-xs font-bold text-white">{initials}</span>
              }
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate font-roboto text-sm font-bold text-white">{post.user.username}</span>
              {post.timestamp && (
                <span className="shrink-0 font-roboto text-xs text-text-muted">{post.timestamp}</span>
              )}
            </div>
          </div>
          <span className="shrink-0 font-roboto text-xs text-purple-light">#{post.tag}</span>
        </div>

        {/* Content */}
        <p className="line-clamp-3 font-roboto text-sm leading-relaxed text-text">{post.content}</p>

        {/* Movie ref */}
        {post.movie && (
          <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-2">
            {post.movie.posterPath && (
              <div className="relative h-14 w-9 shrink-0 overflow-hidden rounded">
                <Image src={posterUrl(post.movie.posterPath)} alt={post.movie.title} fill className="object-cover" sizes="36px" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-roboto text-sm font-bold text-purple-light truncate">
                {post.movie.title}
                <span className="font-normal text-text-muted ml-1">({post.movie.year})</span>
              </p>
              {post.movie.director && (
                <p className="font-roboto text-xs text-text-muted truncate">
                  {post.movie.director}{post.movie.rating ? ` · ★ ${post.movie.rating}` : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </Link>

      {/* Action row — outside the Link so clicks don't bubble up */}
      <div className="flex items-center gap-5 border-t border-text/10 px-4 py-2.5 font-roboto text-sm text-text-muted">
        <button
          type="button"
          onClick={toggleLike}
          className={`inline-flex items-center gap-1.5 transition-colors ${
            liked ? 'text-purple-light' : 'hover:text-text'
          }`}
        >
          <Heart size={15} className={liked ? 'fill-purple-light' : ''} />
          {likeCount}
        </button>

        <Link
          href={`/community/${post.id}`}
          className="inline-flex items-center gap-1.5 hover:text-text transition-colors"
        >
          <MessageCircle size={15} />
          {post.commentCount}
        </Link>

        <button type="button" className="inline-flex items-center gap-1.5 hover:text-text transition-colors" aria-label="Share">
          <Share2 size={15} />
        </button>
      </div>
    </article>
  )
}

export const POST_CARD_DUMMY: PostCardData = {
  id: 'dummy',
  isLiked: false,
  user: { username: 'leon_c' },
  movie: { title: 'Aftersun', year: 2022, director: 'Charlotte Wells', rating: 7.8, posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  content: 'There is a haunting, rhythmic quality to this film that most modern cinema seems to have lost. Every quiet moment feels like a scream.',
  tag: 'Drama',
  likeCount: 34,
  commentCount: 5,
  timestamp: '2h ago',
}
