const BASE_URL = () => process.env.TMDB_BASE_URL
const API_KEY = () => process.env.TMDB_API_KEY

export const tmdbService = {
    getGenres: async () => {
        const res = await fetch(`${BASE_URL()}/genre/movie/list?api_key=${API_KEY()}`)
        return res.json()
    },
    getTrending: async (page = 1) => {
        const res = await fetch(`${BASE_URL()}/trending/movie/week?api_key=${API_KEY()}&page=${page}`)
        return res.json()
    },
    getPopular: async (page = 1) => {
        const res = await fetch(`${BASE_URL()}/movie/popular?api_key=${API_KEY()}&page=${page}`)
        return res.json()
    },
    getTopRated: async (page = 1) => {
        const res = await fetch(`${BASE_URL()}/movie/top_rated?api_key=${API_KEY()}&page=${page}`)
        return res.json()
    },
    discover: async (page = 1) => {
        const res = await fetch(`${BASE_URL()}/discover/movie?api_key=${API_KEY()}&sort_by=vote_count.desc&vote_count.gte=500&page=${page}`)
        return res.json()
    },
    getByGenre: async (genreId: number, page = 1) => {
        const res = await fetch(`${BASE_URL()}/discover/movie?api_key=${API_KEY()}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=5000&page=${page}`)
        return res.json()
    },
    image: (path: string, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500') => {
        return `${process.env.TMDB_IMAGE_BASE_URL}/${size}${path}`
    }
}
