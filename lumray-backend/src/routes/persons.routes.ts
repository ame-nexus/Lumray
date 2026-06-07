import { Router } from 'express'
import { getPersonDetail } from '../controllers/persons.controller'

const router = Router()

router.get('/:id', getPersonDetail)

export default router
