import { Router } from 'express'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'
import { getPosts, createPost, deletePost, likePost, unlikePost, commentOnPost, getPostComments, editComment, deleteComment } from '../controllers/posts.controller'

const router = Router()

router.get('/',                  optionalAuth, getPosts)
router.post('/',                 authenticate, createPost)
router.put('/comments/:commentId',    authenticate, editComment)
router.delete('/comments/:commentId', authenticate, deleteComment)
router.delete('/:id',            authenticate, deletePost)
router.post('/:id/like',         authenticate, likePost)
router.delete('/:id/like',       authenticate, unlikePost)
router.get('/:id/comments',      getPostComments)
router.post('/:id/comments',     authenticate, commentOnPost)

export default router
