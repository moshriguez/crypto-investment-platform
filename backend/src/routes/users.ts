import express from "express";

import { deleteUser, getUser, signin, signup, updateUser } from '../controllers/users'
import auth from '../middleware/auth'

const router = express.Router()

router.get('/:id', auth, getUser)
router.patch('/:id', auth, updateUser)
router.post('/signin', signin)
router.post('/signup', signup)
router.delete('/:id', auth, deleteUser)

export default router