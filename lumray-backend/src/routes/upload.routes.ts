import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { uploadAvatar, uploadCover } from '../controllers/upload.controller'

const router = Router()

router.post('/avatar', authenticate, upload.single('file'), uploadAvatar)
router.post('/cover',  authenticate, upload.single('file'), uploadCover)

export default router
