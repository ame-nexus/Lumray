import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { getConversations, getUnreadCount, startConversation, getMessages, sendMessage, editMessage, deleteMessage, uploadAttachment } from '../controllers/messages.controller'

const router = Router()

router.get('/unread-count',                       authenticate, getUnreadCount)
router.get('/conversations',                      authenticate, getConversations)
router.post('/conversations',                     authenticate, startConversation)
router.get('/conversations/:conversationId',      authenticate, getMessages)
router.post('/conversations/:conversationId',     authenticate, sendMessage)
router.put('/message/:messageId',                 authenticate, editMessage)
router.delete('/message/:messageId',              authenticate, deleteMessage)
router.post('/upload',                            authenticate, upload.single('file'), uploadAttachment)

export default router
