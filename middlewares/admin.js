import UserRole from '../enums/userRole.js'

import { StatusCodes } from 'http-status-codes'

export default (req, res, next) => {
  // 如果不是管理員，就回傳'權限不足'，如果是管理員的話，就繼續執行下一個 middleware
  if (req.user.role !== UserRole.ADMIN) {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: '權限不足'
    })
  } else {
    next()
  }
}
