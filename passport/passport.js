import passport from 'passport'
import passportLocal from 'passport-local'
import passportJWT from 'passport-jwt'
import bcrypt from 'bcrypt'
import users from '../models/users.js'

passport.use('login', new passportLocal.Strategy({
  // 使用local的驗證方式，passportLocal的驗證策略
  usernameField: 'email',
  // 我們傳進來的資料裡面，帳號的欄位名稱是 account
  passwordField: 'password'
  // 我們傳進來的資料裡面，密碼的欄位名稱是 password
}, async (email, password, done) => {
  try {
    const user = await users.findOne({ email })
    if (!user) {
      throw new Error('ACCOUNT')
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error('PASSWORD')
    }
    return done(null, user, null)
  } catch (error) {
    console.log(error)
    if (error.message === 'ACCOUNT') {
      return done(null, null, { message: '帳號不存在' })
    } else if (error.message === 'PASSWORD') {
      return done(null, null, { message: '密碼錯誤' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))

// JWT 驗證策略 驗證後執行一個 async function
passport.use('jwt', new passportJWT.Strategy({
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true,
  // 略過過期檢查
  ignoreExpiration: true
}, async (req, payload, done) => {
  // req 請求的資訊, payload 解譯出來的資料，done 驗證後執行的 callback
  try {
    // 檢查過期
    // jwt 過期時間單位是秒，node.js 日期單位是毫秒
    const expired = payload.exp * 1000 < new Date().getTime()

    const url = req.baseUrl + req.path
    if (expired && url !== '/users/extend' && url !== '/users/logout') {
      throw new Error('EXPIRED')
    }

    // const token = req.headers.authorization.split(' ')
    const token = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()(req)
    // 取了之後檢查有沒有這個使用者存在
    const user = await users.findOne({ _id: payload._id, tokens: token })
    if (!user) {
      throw new Error('JWT')
    }

    return done(null, { user, token }, null)
  } catch (error) {
    console.log(error)
    if (error.message === 'EXPIRED') {
      return done(null, null, { message: 'JWT 過期' })
    } else if (error.message === 'JWT') {
      return done(null, null, { message: 'JWT 無效' })
    } else {
      return done(null, null, { message: '未知錯誤' })
    }
  }
}))
