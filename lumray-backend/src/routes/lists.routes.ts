import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getLists, getListsByMovie, createList, updateList, deleteList, addListItem, removeListItem } from '../controllers/lists.controller'

const router = Router()

router.get('/by-movie/:movieId',      getListsByMovie)
router.get('/',                       getLists)
router.post('/',                      authenticate, createList)
router.put('/:id',                    authenticate, updateList)
router.delete('/:id',                 authenticate, deleteList)
router.post('/:id/items',             authenticate, addListItem)
router.delete('/:id/items/:movieId',  authenticate, removeListItem)

export default router
