import Image from 'next/image'
import { Heart, MessageCircle, Share2 } from 'lucide-react'

export interface PostCardData {
  user: { username: string; avatar: string }
  movie?: { title: string; year: number }
  content: string
  tag: string
  likeCount: number
  commentCount: number
}

export interface PostCardProps {
  post: PostCardData
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-xl border border-text/10 bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-purple">
            <Image
              src={post.user.avatar}
              alt={post.user.username}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="truncate font-outfit text-sm font-medium text-white">
            {post.user.username}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-purple/25 px-2.5 py-0.5 font-roboto text-xs text-purple-light">
          #{post.tag}
        </span>
      </div>

      {post.movie && (
        <p className="mt-2 font-roboto text-xs text-text-muted">
          {post.movie.title} ({post.movie.year})
        </p>
      )}

      <p className="mt-3 line-clamp-3 font-roboto text-sm leading-relaxed text-text">
        {post.content}
      </p>

      <div className="mt-4 flex items-center gap-5 font-roboto text-sm text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Heart size={16} />
          {post.likeCount}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle size={16} />
          {post.commentCount}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 hover:text-text transition-colors"
          aria-label="Share post"
        >
          <Share2 size={16} />
        </button>
      </div>
    </article>
  )
}

export const POST_CARD_DUMMY: PostCardData = {
  user: { username: 'maria_films', avatar: 'https://i.pravatar.cc/150?u=maria' },
  movie: { title: 'Inception', year: 2010 },
  content:
    'Just rewatched this for the fifth time and the hallway fight still blows my mind. Nolan at his peak — who else is due for a rewatch this weekend?',
  tag: 'mindbender',
  likeCount: 42,
  commentCount: 8,
}
