import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getDiary, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from '../controllers/diary.controller'

const router = Router()

router.get('/',      authenticate, getDiary)
router.post('/',     authenticate, createDiaryEntry)
router.put('/:id',   authenticate, updateDiaryEntry)
router.delete('/:id',authenticate, deleteDiaryEntry)

export default router
