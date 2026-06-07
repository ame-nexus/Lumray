import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { upsertRating, deleteRating, getMyRating } from '../controllers/ratings.controller'

const router = Router()

router.get('/:movieId',    authenticate, getMyRating)
router.post('/',           authenticate, upsertRating)
router.delete('/:movieId', authenticate, deleteRating)

export default router
