import { Router } from 'express'
import { getPersonDetail, getPersonTranslation } from '../controllers/persons.controller'

const router = Router()

router.get('/:id/translation', getPersonTranslation)
router.get('/:id', getPersonDetail)

export default router
