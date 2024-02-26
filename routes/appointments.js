import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import { create, edit, getAll, get, getDateAppointments } from '../controllers/appointments.js'
import admin from '../middlewares/admin.js'

const router = Router()

router.post('/', auth.jwt, admin, create)
// 驗證有沒有登入jwt > 管理員驗證判斷權限 > 創建時段塞進資料庫
router.get('/all', auth.jwt, admin, getAll)
// 驗證有沒有登入jwt > 管理員驗證判斷權限 > 查詢所有時段
router.patch('/:id', auth.jwt, admin, edit)
// 驗證有沒有登入jwt > 管理員驗證判斷權限 > 修改時段資料
router.get('/', get)
// 查詢時段(前台用)，不須登入，不須驗證權限
router.get('/date', getDateAppointments)
// 查詢當天時段(前台用)

export default router
