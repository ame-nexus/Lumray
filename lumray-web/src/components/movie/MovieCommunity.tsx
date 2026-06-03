'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReviewCard, { type ReviewCardProps } from '@/components/movie/ReviewCard'

export interface MovieCommunityProps {
  movieId: string
  reviews: ReviewCardProps[]
}

type Tab = 'reviews' | 'posts' | 'lists'

export default function MovieCommunity({ movieId, reviews }: MovieCommunityProps) {
  const [tab, setTab] = useState<Tab>('reviews')

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-outfit text-xl font-bold text-text">Community</h2>
        <Link
          href={`/films/${movieId}/reviews`}
          className="font-roboto text-sm text-purple-light underline"
        >
          check all reviews →
        </Link>
      </div>

      <div className="mb-4 flex gap-6 border-b border-text/10">
        {(['reviews', 'posts', 'lists'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`pb-2 font-outfit text-sm font-medium capitalize transition-colors ${
              tab === key
                ? 'border-b-2 border-purple-light text-purple-light'
                : 'text-text-muted'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {tab === 'reviews' ? (
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review, i) => (
            <ReviewCard key={`${review.user.username}-${i}`} {...review} />
          ))}
        </div>
      ) : (
        <p className="py-4 font-roboto text-sm text-text-muted">Coming soon.</p>
      )}
    </section>
  )
}

export const DUMMY_MOVIE_COMMUNITY: MovieCommunityProps = {
  movieId: '965150',
  reviews: [
    {
      user: { username: 'rach_m', avatar: 'https://i.pravatar.cc/150?u=rach' },
      rating: 5,
      content:
        'There is a haunting, rhythmic quality to this film that most modern cinema seems to have lost in the edit. Every frame of Aftersun feels like a memory you are afraid to lose.',
      likeCount: 41,
      commentCount: 11,
      createdAt: '2 May 2023',
    },
    {
      user: { username: 'slowcinema', avatar: null },
      rating: 5,
      content:
        'Charlotte Wells captures the gap between what we remember and what was really there. The dance floor scene destroyed me.',
      likeCount: 28,
      commentCount: 5,
      createdAt: '14 Apr 2023',
    },
    {
      user: { username: 'a24fan', avatar: 'https://i.pravatar.cc/150?u=a24' },
      rating: 4,
      content:
        'Quiet, devastating, and beautifully acted. Paul Mescal and Frankie Corio are incredible together.',
      likeCount: 19,
      commentCount: 3,
      createdAt: '3 Mar 2023',
    },
  ],
}
