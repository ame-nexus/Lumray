import { Heart, MessageCircle, Star } from 'lucide-react'
import Image from 'next/image'

export interface ReviewCardProps {
  user: { username: string; avatar?: string | null }
  rating: number
  content: string
  likeCount: number
  commentCount: number
  createdAt?: string
}

function usernameInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={
            i < rating ? 'fill-purple-light text-purple-light' : 'text-text-muted'
          }
        />
      ))}
    </div>
  )
}

export default function ReviewCard({
  user,
  rating,
  content,
  likeCount,
  commentCount,
  createdAt,
}: ReviewCardProps) {
  return (
    <article className="rounded-xl border border-text/10 bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-purple">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.username}
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                {usernameInitials(user.username)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-outfit text-sm font-medium text-text">{user.username}</p>
            {createdAt && (
              <p className="font-roboto text-xs text-text-muted">{createdAt}</p>
            )}
          </div>
        </div>
        <StarRow rating={rating} />
      </div>

      <p className="mt-3 font-roboto text-sm leading-relaxed text-text">{content}</p>

      <div className="mt-4 flex items-center gap-3 font-roboto text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <Heart size={12} />
          {likeCount} likes
        </span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={12} />
          {commentCount} comments
        </span>
      </div>
    </article>
  )
}

export const DUMMY_REVIEW_CARD: ReviewCardProps = {
  user: { username: 'rach_m', avatar: 'https://i.pravatar.cc/150?u=rach' },
  rating: 5,
  content:
    'There is a haunting, rhythmic quality to this film that most modern cinema seems to have lost in the edit. Every frame of Aftersun feels like a memory you are afraid to lose.',
  likeCount: 41,
  commentCount: 11,
  createdAt: '2 May 2023',
}
