import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { getConversations, startConversation, getMessages, sendMessage, uploadAttachment } from '../controllers/messages.controller'

const router = Router()

router.get('/conversations',                      authenticate, getConversations)
router.post('/conversations',                     authenticate, startConversation)
router.get('/conversations/:conversationId',      authenticate, getMessages)
router.post('/conversations/:conversationId',     authenticate, sendMessage)
router.post('/upload',                            authenticate, upload.single('file'), uploadAttachment)

export default router
