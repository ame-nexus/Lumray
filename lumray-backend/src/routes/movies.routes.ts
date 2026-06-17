import { Router } from 'express'
import { getByGenre, getTopRated, browseMovies, getMovieDetail, getSimilarMovies, getSoundtrack, getMovieTranslation, getPopularWithFriends, getRecommended, getGenrePreviews } from '../controllers/movies.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// Named routes before /:id
router.get('/browse',               browseMovies)
router.get('/genre-previews',       getGenrePreviews)
router.get('/top-rated',            getTopRated)
router.get('/by-genre/:genreId',    getByGenre)
router.get('/friends-watching',     authenticate, getPopularWithFriends)
router.get('/recommended',          authenticate, getRecommended)
router.get('/:id/similar',          getSimilarMovies)
router.get('/:id/soundtrack',       getSoundtrack)
router.get('/:id/translation',      getMovieTranslation)

// Dynamic last
router.get('/:id', getMovieDetail)

export default router