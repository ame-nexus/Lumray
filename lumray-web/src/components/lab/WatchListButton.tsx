'use client'

import { useWatchlistStore } from "@/store/lab/watchlist.store"

interface Props {
    movieId:    string
    title:      string
    posterPath: string | null
}

export default function WatchListButton({ movieId, title, posterPath }: Props) {
    const movies = useWatchlistStore(s => s.movies)
    const add    = useWatchlistStore(s => s.add)
    const remove = useWatchlistStore(s => s.remove)
    const added  = movies.some(m => m.id === movieId)

    function toggle() {
        if (added) remove(movieId)
        else add({ id: movieId, title, posterPath })
    }

    return (
        <button
            onClick={toggle}
            className={`px-3 py-1 rounded-lg text-sm ${
                added
                    ? 'bg-[#714ee4] text-white'
                    : 'border border-[#ede9fc]/20 text-[#ede9fc]'
            }`}
        >
            {added ? 'Added' : 'Add to Watchlist'}
        </button>
    )
}
