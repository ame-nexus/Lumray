import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import {
    getReviews, createReview, updateReview,
    deleteReview, likeReview, unlikeReview,
} from '../controllers/reviews.controller'

const router = Router()

router.get('/',               getReviews)
router.post('/',              authenticate, createReview)
router.put('/:id',            authenticate, updateReview)
router.delete('/:id',         authenticate, deleteReview)
router.post('/:id/like',      authenticate, likeReview)
router.delete('/:id/like',    authenticate, unlikeReview)

export default router
