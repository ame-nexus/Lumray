'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/services/api"

interface Movie {
    id: string
    title: string
    posterPath: string | null
}

async function fetchMovies(): Promise<Movie[]> {
    const res = await api.get('/api/movies/top-rated')
    return res.data.data
}

export default function SearchPage() {
    const queryClient = useQueryClient()

    const { data: movies, isLoading, isError } = useQuery({
        queryKey: ['movies'],
        queryFn: fetchMovies,
    })

    const addMutation = useMutation({
        mutationFn: (movie: Movie) => api.post('/api/watchlist', movie),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
        onError: () => console.log('failed to add')
    })

    if (isLoading) return <p className="text-[#7a7882]">Loading...</p>
    if (isError) return <p className="text-red-400">Failed to load</p>

    return (
        <div>
            <h1 className="text-[#ede9fc] text-2xl font-bold mb-6">Movies</h1>
            <div className="flex flex-col gap-2">
                {movies?.map(movie => (
                    <div key={movie.id} className="bg-[#383a47] rounded-lg p-3 text-[#ede9fc] flex justify-between items-center">
                        <span>{movie.title}</span>
                        <button
                            onClick={() => addMutation.mutate(movie)}
                            disabled={addMutation.isPending}
                            className="px-3 py-1 rounded-lg text-sm bg-[#714ee4] text-white disabled:opacity-50"
                        >
                            {addMutation.isPending ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}