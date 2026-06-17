import { Router } from 'express'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'
import { getAllPublicLists, getListDetail, getLists, getListsByMovie, createList, updateList, deleteList, addListItem, removeListItem } from '../controllers/lists.controller'

const router = Router()

router.get('/all',                    getAllPublicLists)
router.get('/by-movie/:movieId',      getListsByMovie)
router.get('/',                       getLists)
router.post('/',                      authenticate, createList)
router.put('/:id',                    authenticate, updateList)
router.delete('/:id',                 authenticate, deleteList)
router.post('/:id/items',             authenticate, addListItem)
router.delete('/:id/items/:movieId',  authenticate, removeListItem)
router.get('/:id',                    optionalAuth, getListDetail)

export default router
