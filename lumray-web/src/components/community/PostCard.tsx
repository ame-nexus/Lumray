import Image from 'next/image'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

export interface PostCardData {
  user: { username: string; avatar?: string }
  movie?: { title: string; year: number; director?: string; rating?: number; posterPath?: string }
  content: string
  tag: string
  likeCount: number
  commentCount: number
  timestamp?: string
}

function posterUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/w300${path}`
}

export default function PostCard({ post }: { post: PostCardData }) {
  const initials = post.user.username.slice(0, 2).toUpperCase()

  return (
    <article className="rounded-xl border border-text/10 bg-surface p-4 flex flex-col gap-3">
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
            {post.timestamp && <span className="shrink-0 font-roboto text-xs text-text-muted">{post.timestamp}</span>}
          </div>
        </div>
        <span className="shrink-0 font-roboto text-xs text-purple-light">#{post.tag}</span>
      </div>

      {/* Content */}
      <p className="line-clamp-3 font-roboto text-sm leading-relaxed text-text">{post.content}</p>

      {/* Movie ref card */}
      {post.movie && (
        <div className="flex items-center gap-3 rounded-lg bg-surface-2 p-2">
          {post.movie.posterPath && (
            <div className="relative h-14 w-9 shrink-0 overflow-hidden rounded">
              <Image src={posterUrl(post.movie.posterPath)} alt={post.movie.title} fill className="object-cover" sizes="36px" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-roboto text-sm font-bold text-purple-light truncate">
              {post.movie.title} <span className="font-normal text-text-muted">({post.movie.year})</span>
            </p>
            {post.movie.director && (
              <p className="font-roboto text-xs text-text-muted truncate">
                {post.movie.director}{post.movie.rating ? ` · ★ ${post.movie.rating}` : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 font-roboto text-sm text-text-muted border-t border-text/10 pt-2">
        <span className="inline-flex items-center gap-1.5"><Heart size={15} />{post.likeCount}</span>
        <span className="inline-flex items-center gap-1.5"><MessageCircle size={15} />{post.commentCount}</span>
        <button type="button" className="inline-flex items-center gap-1.5 hover:text-text transition-colors" aria-label="Share">
          <Share2 size={15} />
        </button>
      </div>
    </article>
  )
}

export const POST_CARD_DUMMY: PostCardData = {
  user: { username: 'leon_c' },
  movie: { title: 'Aftersun', year: 2022, director: 'Charlotte Wells', rating: 7.8, posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  content: 'There is a haunting, rhythmic quality to this film that most modern cinema seems to have lost. Every quiet moment feels like a scream.',
  tag: 'Drama',
  likeCount: 34,
  commentCount: 5,
  timestamp: '2h ago',
}
