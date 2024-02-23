import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const cartSchema = new Schema({
  product: {
    type: ObjectId,
    ref: 'products',
    required: [true, '缺少商品欄位']
  },
  quantity: {
    type: Number,
    required: [true, '缺少商品數量']
  }
})

const schema = new Schema({
  account: {
    type: String,
    required: [true, '使用者帳號必填'],
    minlength: [4, '使用者帳號最少4個字'],
    maxlength: [12, '使用者帳號最多12個字'],
    unique: true,
    // unique: true 在整個集合中必須是唯一的
    validate: {
      // 限制帳號是不是只有英文和數字，可用正規表示法或 validator 套件的 isAlphanumeric 做驗證
      validator (value) {
        return validator.isAlphanumeric(value)
      },
      message: '使用者帳號只能是英文和數字'
    }
  },
  email: {
    type: String,
    required: [true, '使用者信箱必填'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '信箱格式不正確'
    }
  },
  password: {
    type: String,
    required: [true, '使用者密碼必填']
  },
  tokens: {
    type: [String]
  },
  cart: {
    type: [cartSchema],
    default: []
  },
  role: {
    type: Number,
    default: UserRole.USER
    // 在 back/enums/UserRole.js 裡面另外定義 0 使用者 1 管理員
    // .USER => 預設值會被設定為 0，這代表用戶的角色是 USER
  }
}, {
  // 設定 Schema 的行為，所以另外寫在第二個參數{}
  timestamps: true, // 紀錄 建立日期、更新日期，自動生成 createdAt、updatedAt
  versionKey: false // 不要 __v 這個欄位，不用記錄所有東西被改了幾次
})

// mongoose 的 virtual setter 虛擬欄位語法
schema.virtual('cartQuantity')
  .get(function () {
    return this.cart.reduce((total, current) => {
      return total + current.quantity
    }, 0)
  })

schema.pre('save', async function (next) {
  // 存進資料庫之前，執行這個 function (箭頭函式沒有 this，要寫成一般的 function)
  const user = this
  // 這裡的 this 指的是 user document 準備保存進去的資料
  if (user.isModified('password')) {
    // 如果密碼有被修改過，就執行
    if (user.password.length < 4 || user.password.length > 12) {
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidationError({ message: '密碼長度最少 4 個字，最多 12 個字' }))
      next(error)
      return
    }
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

export default model('users', schema)
