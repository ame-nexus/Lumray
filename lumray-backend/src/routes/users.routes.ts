import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getProfile, updateProfile, followUser, unfollowUser, getFollowStatus } from '../controllers/users.controller'

const router = Router()

router.get('/me',                authenticate, updateProfile)  // handled by auth/me but kept for completeness
router.put('/me',                authenticate, updateProfile)
router.get('/:username',         getProfile)
router.get('/:id/follow-status', authenticate, getFollowStatus)
router.post('/:id/follow',       authenticate, followUser)
router.delete('/:id/follow',     authenticate, unfollowUser)

export default router
