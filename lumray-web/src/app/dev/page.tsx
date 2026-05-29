'use client'

import MovieRow, { MOVIE_ROW_DUMMY } from '@/components/films/MovieRow'
import GenreCard, { GENRE_CARD_DUMMY } from '@/components/films/GenreCard'
import CommunityReview, { COMMUNITY_REVIEW_DUMMY } from '@/components/community/CommunityReview'
import PostCard, { POST_CARD_DUMMY } from '@/components/community/PostCard'

export default function DevPreviewPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-14 px-6 py-10">
      <h1 className="font-outfit text-2xl font-semibold text-purple-light">
        Component preview (dev only)
      </h1>

      <MovieRow
        title="Popular This Week"
        movies={MOVIE_ROW_DUMMY}
        moreHref="/films"
      />

      <section>
        <h2 className="mb-4 font-outfit text-lg text-text-muted">GenreCard</h2>
        <div className="flex flex-wrap gap-4">
          {GENRE_CARD_DUMMY.map((genre) => (
            <GenreCard key={genre.name} {...genre} />
          ))}
        </div>
      </section>

      <CommunityReview reviews={COMMUNITY_REVIEW_DUMMY} />

      <section className="max-w-xl">
        <h2 className="mb-4 font-outfit text-lg text-text-muted">PostCard</h2>
        <PostCard post={POST_CARD_DUMMY} />
      </section>
    </main>
  )
}
