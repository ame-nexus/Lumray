import axios from 'axios'

const BASE_URL = () => process.env.TMDB_BASE_URL
const API_KEY  = () => process.env.TMDB_API_KEY

const tmdb = axios.create({ timeout: 15000 })

export const tmdbService = {
    getGenres: async () => {
        const { data } = await tmdb.get(`${BASE_URL()}/genre/movie/list?api_key=${API_KEY()}`)
        return data
    },
    getTrending: async (page = 1) => {
        const { data } = await tmdb.get(`${BASE_URL()}/trending/movie/week?api_key=${API_KEY()}&page=${page}`)
        return data
    },
    getPopular: async (page = 1) => {
        const { data } = await tmdb.get(`${BASE_URL()}/movie/popular?api_key=${API_KEY()}&page=${page}`)
        return data
    },
    getTopRated: async (page = 1) => {
        const { data } = await tmdb.get(`${BASE_URL()}/movie/top_rated?api_key=${API_KEY()}&page=${page}`)
        return data
    },
    discover: async (page = 1) => {
        const { data } = await tmdb.get(`${BASE_URL()}/discover/movie?api_key=${API_KEY()}&sort_by=vote_count.desc&vote_count.gte=300&include_adult=false&page=${page}`)
        return data
    },
    getMovieDetail: async (id: number) => {
        const { data } = await tmdb.get(`${BASE_URL()}/movie/${id}?api_key=${API_KEY()}&append_to_response=credits`)
        return data
    },
    getByGenre: async (genreId: number, page = 1) => {
        const { data } = await tmdb.get(`${BASE_URL()}/discover/movie?api_key=${API_KEY()}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=5000&page=${page}`)
        return data
    },
    image: (path: string, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500') => {
        return `${process.env.TMDB_IMAGE_BASE_URL}/${size}${path}`
    }
}
