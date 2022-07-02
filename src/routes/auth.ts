import express from 'express'
import {
  passportLoginCallback,
  logout,
  checkIsAuthenticated
} from '../controllers/auth'
import { create } from '../controllers/user'

const router = express.Router()

router.route('/').post(passportLoginCallback).get(checkIsAuthenticated)
router.route('/logout').get(logout)
router.route('/signup').post(create)

export default router 