export const tmdbService = {
    getTopRated: async () => {
        const BASE_URL = process.env.TMDB_BASE_URL
        const API_KEY = process.env.TMDB_API_KEY
        const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`)
        return res.json()
    },
    getPopular: async () =>{
        const BASE_URL = process.env.TMDB_BASE_URL
        const API_KEY = process.env.TMDB_API_KEY
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)
        return res.json()
    },

    image: (path: string, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500') => {
        return `${process.env.TMDB_IMAGE_BASE_URL}/${size}${path}`
    }
}