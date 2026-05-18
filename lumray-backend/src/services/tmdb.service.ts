export const tmdbService = {
    getTopRated: async () => {
        const BASE_URL = process.env.TMDB_BASE_URL
        const API_KEY = process.env.TMDB_API_KEY
        const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`)
        return res.json()
    },
    getByGenre: async (genreId: number) => {
        const BASE_URL = process.env.TMDB_BASE_URL
        const API_KEY = process.env.TMDB_API_KEY
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=5000`)
        return res.json()
    },
    image: (path: string, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500') => {
        return `${process.env.TMDB_IMAGE_BASE_URL}/${size}${path}`
    }
}
