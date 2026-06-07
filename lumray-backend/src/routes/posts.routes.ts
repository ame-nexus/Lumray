import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getPosts, createPost, deletePost, likePost, unlikePost, commentOnPost } from '../controllers/posts.controller'

const router = Router()

router.get('/',                  getPosts)
router.post('/',                 authenticate, createPost)
router.delete('/:id',            authenticate, deletePost)
router.post('/:id/like',         authenticate, likePost)
router.delete('/:id/like',       authenticate, unlikePost)
router.post('/:id/comments',     authenticate, commentOnPost)

export default router
