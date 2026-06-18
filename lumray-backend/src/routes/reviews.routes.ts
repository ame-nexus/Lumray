import { Router } from 'express'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'
import {
    getFeaturedReviews,
    getReview, getReviews, createReview, updateReview,
    deleteReview, likeReview, unlikeReview,
    getReviewComments, addReviewComment, deleteReviewComment,
} from '../controllers/reviews.controller'

const router = Router()

router.get('/featured',                      getFeaturedReviews)
router.get('/',                              optionalAuth, getReviews)
router.get('/:id',                           optionalAuth, getReview)
router.post('/',                             authenticate, createReview)
router.put('/:id',                           authenticate, updateReview)
router.delete('/:id',                        authenticate, deleteReview)
router.post('/:id/like',                     authenticate, likeReview)
router.delete('/:id/like',                   authenticate, unlikeReview)
router.get('/:id/comments',                  getReviewComments)
router.post('/:id/comments',                 authenticate, addReviewComment)
router.delete('/:id/comments/:commentId',    authenticate, deleteReviewComment)

export default router
