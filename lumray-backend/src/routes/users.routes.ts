import { Router } from 'express'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'
import {
    getProfile, updateProfile, followUser, unfollowUser, getFollowStatus, getMyFollowing,
    getMutualFollows,
    getUserFilms, getUserDiary, getUserReviews, getUserFavourites, getUserStats, getUserActivity,
} from '../controllers/users.controller'

const router = Router()

router.get('/me',                    authenticate, updateProfile)
router.put('/me',                    authenticate, updateProfile)
router.get('/me/following',          authenticate, getMyFollowing)
router.get('/me/mutual-follows',     authenticate, getMutualFollows)
router.get('/:username/films',       getUserFilms)
router.get('/:username/diary',       getUserDiary)
router.get('/:username/reviews',     optionalAuth, getUserReviews)
router.get('/:username/favourites',  getUserFavourites)
router.get('/:username/stats',       getUserStats)
router.get('/:username/activity',    getUserActivity)
router.get('/:username',             getProfile)
router.get('/:id/follow-status',     authenticate, getFollowStatus)
router.post('/:id/follow',           authenticate, followUser)
router.delete('/:id/follow',         authenticate, unfollowUser)

export default router
