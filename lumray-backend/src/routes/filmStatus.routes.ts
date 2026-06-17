import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getFilmStatus, getFilmStatusBatch, toggleWatched, toggleFavourite, toggleWatchlist } from '../controllers/filmStatus.controller'

const router = Router()

router.post('/batch',              authenticate, getFilmStatusBatch)
router.get('/:movieId',            authenticate, getFilmStatus)
router.post('/:movieId/watched',   authenticate, toggleWatched)
router.post('/:movieId/favourite', authenticate, toggleFavourite)
router.post('/:movieId/watchlist', authenticate, toggleWatchlist)

export default router
