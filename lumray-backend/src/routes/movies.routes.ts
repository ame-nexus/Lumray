import { Router } from 'express'
import { getByGenre, getTopRated, browseMovies, getMovieDetail } from '../controllers/movies.controller'

const router = Router()

// Named routes before /:id
router.get('/browse', browseMovies)
router.get('/top-rated', getTopRated)
router.get('/by-genre/:genreId', getByGenre)

// Dynamic last
router.get('/:id', getMovieDetail)

export default router