import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import { create, edit, getAll, get, getDateAppointments } from '../controllers/appointments.js'
import admin from '../middlewares/admin.js'

const router = Router()

router.post('/', auth.jwt, admin, create)
router.get('/all', auth.jwt, admin, getAll)
router.patch('/:id', auth.jwt, admin, edit)
router.get('/', get)
router.get('/date', getDateAppointments)

export default router
