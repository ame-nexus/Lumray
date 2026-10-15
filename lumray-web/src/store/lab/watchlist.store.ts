import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WatchlistMovie {
    id: string
    title: string
    posterPath: string | null
}

interface WatchlistStore {
    movies: WatchlistMovie[]
    add:    (movie: WatchlistMovie) => void
    remove: (id: string) => void
    has:    (id: string) => boolean
}

export const useWatchlistStore = create<WatchlistStore>()(
    persist(
        (set, get) => ({
            movies: [],
            add:    (movie) => set((state) => ({ movies: [...state.movies, movie] })),
            remove: (id)    => set((state) => ({ movies: state.movies.filter(m => m.id !== id) })),
            has:    (id)    => get().movies.some(m => m.id === id),
        }),
        {
            name:    'watchlist',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
