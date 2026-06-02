'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import MovieRow, { MOVIE_ROW_DUMMY } from '@/components/films/MovieRow'
import PostCard, { POST_CARD_DUMMY } from '@/components/community/PostCard'
import CommunityReview, { COMMUNITY_REVIEW_DUMMY } from '@/components/community/CommunityReview'
import GenreCard, { GENRE_CARD_DUMMY } from '@/components/films/GenreCard'

export default function HomePage() {
    const user = useAuthStore(s => s.user)

    return (
        <main className="px-6 md:px-12 xl:px-60 py-10 flex flex-col gap-10">
            <MovieRow title="Popular This Week" movies={MOVIE_ROW_DUMMY} />

            {/* Only logged-in users see friend activity */}
            {user && <MovieRow title="Popular With Friends" movies={MOVIE_ROW_DUMMY} />}

            <MovieRow title={user ? "Recommended For You" : "Top Rated"} movies={MOVIE_ROW_DUMMY} />

            {/* Genres */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-outfit text-lg font-bold text-text lg:text-xl">Genres to Explore</h2>
                    <Link href="/films" className="font-roboto text-sm text-white underline underline-offset-2 hover:text-text-muted transition-colors">all genre</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {GENRE_CARD_DUMMY.map((g) => <GenreCard key={g.name} {...g} />)}
                </div>
            </section>

            <CommunityReview reviews={COMMUNITY_REVIEW_DUMMY} />

            {/* Community posts */}
            <section>
                <h2 className="font-outfit text-lg font-bold text-text lg:text-xl mb-4">Community Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <PostCard key={i} post={POST_CARD_DUMMY} />
                    ))}
                </div>
                {/* Guests see a sign-up prompt */}
                {!user && (
                    <div className="mt-6 rounded-xl border border-text/10 bg-surface p-6 text-center">
                        <p className="font-roboto text-text-muted mb-3">Sign in to write posts and interact with the community</p>
                        <Link href="/signup" className="inline-block bg-purple text-white font-medium text-sm px-5 py-2 rounded-full hover:bg-purple-deep transition-colors">
                            Get Started
                        </Link>
                    </div>
                )}
            </section>
        </main>
    )
}
