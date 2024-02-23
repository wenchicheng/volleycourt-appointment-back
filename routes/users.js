import { Router } from 'express'
import { create, login, logout, extend, getProfile, editCart, getCart } from '../controllers/users.js'
import * as auth from '../middlewares/auth.js'

const router = Router()
router.post('/', create)
router.post('/login', auth.login, login)
router.delete('/logout', auth.jwt, logout)
router.patch('/extend', auth.jwt, extend)
router.get('/me', auth.jwt, getProfile)
router.patch('/cart', auth.jwt, editCart)
router.get('/cart', auth.jwt, getCart)
// register註冊   用戶提交資料（如用戶名密碼），並在資料庫中創建一個新的用戶記錄
// login登入   使用用戶資訊來進行登入操作
// logout登出
// extend舊換新
// getProfile獲取個人信息

export default router
