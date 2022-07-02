import express from 'express'
import {
  create,
  getAll,
  getById,
  updateById,
  deleteById
} from '../controllers/user'

const router = express.Router()

router.route('/').post(create).get(getAll)
router.route('/:id').get(getById).put(updateById).delete(deleteById)

export default router