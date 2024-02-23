import products from '../models/products.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'

// 新增商品====================================================================
export const create = async (req, res) => {
  try {
    req.body.image = req.file.path
    const result = await products.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 後台用，查所有商品============================================================
export const getAll = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt'
    // sortBy 是排序欄位，預設是 createdAt
    const sortOrder = parseInt(req.query.sortOrder) || -1
    // 資料排序，sortBy 是排序欄位，sortOrder 是排序方式（1 是升冪，-1 是降冪) ，parseInt() 是將字串轉換為數字
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 20
    // itemsPerPage 是每頁顯示多少筆資料，預設是 20
    const page = parseInt(req.query.page) || 1
    // page 是目前在第幾頁，預設是第一頁
    const regex = new RegExp(req.query.search || '', 'i')
    // 查詢條件，關鍵字查詢 regex 是正則表達式，i 是忽略大小寫

    // 查詢商品資料語法
    // 1. 查詢 name 或 description 符合 regex 的資料
    const data = await products
      .find({
        $or: [
          { name: regex },
          { description: regex }
        ]
      })
      // 2. 查詢完對結果作排序，[sortBy] => 不是陣列，是把變數的值當成物件的屬性名稱key
      .sort({ [sortBy]: sortOrder })
      // 3.跳過多少筆資料，如果1頁10筆，第1頁是 (1-1)*10，第2頁是 (2-1)*10 ，第3頁是 (3-1)*10，以此類推
      .skip((page - 1) * itemsPerPage)
      // 4. 限制一頁幾筆資料
      .limit(itemsPerPage === -1 ? undefined : itemsPerPage)

    // estimatedDocumentCount() 計算總資料數，這裡不適用 / countDocuments() 是依照()內篩選查詢符合條件的資料數，而不是全部資料數
    const total = await products.estimatedDocumentCount()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 前台用，只查有上架的商品=======================================================
export const get = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || 'createdAt'
    // sortBy 是排序欄位，預設是 createdAt
    const sortOrder = parseInt(req.query.sortOrder) || -1
    // 資料排序，sortBy 是排序欄位，sortOrder 是排序方式（1 是升冪，-1 是降冪) ，parseInt() 是將字串轉換為數字
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 20
    // itemsPerPage 是每頁顯示多少筆資料，預設是 20
    const page = parseInt(req.query.page) || 1
    // page 是目前在第幾頁，預設是第一頁
    const regex = new RegExp(req.query.search || '', 'i')
    // 查詢條件，關鍵字查詢 regex 是正則表達式，i 是忽略大小寫

    // 查詢商品資料語法
    // 1. 查詢 name 或 description 符合 regex 的資料
    const data = await products
      .find({
        sell: true,
        // sell: true 只查有上架的商品
        $or: [
          { name: regex },
          { description: regex }
        ]
      })
      // 2. 查詢完對結果作排序，[sortBy] => 不是陣列，是把變數的值當成物件的屬性名稱key
      .sort({ [sortBy]: sortOrder })
      // 3.跳過多少筆資料，如果1頁10筆，第1頁是 (1-1)*10，第2頁是 (2-1)*10 ，第3頁是 (3-1)*10，以此類推
      .skip((page - 1) * itemsPerPage)
      // 4. 限制一頁幾筆資料
      .limit(itemsPerPage === -1 ? undefined : itemsPerPage)

    // estimatedDocumentCount() 計算總資料數，這裡不適用 / countDocuments() 是依照()內篩選查詢符合條件的資料數，而不是全部資料數
    const total = await products.countDocuments({ sell: true })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}

// 取得單一商品=================================================================
export const getId = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')
    // 檢查請求的參數 id 是否為有效的 MongoDB ID

    const result = await products.findById(req.params.id)

    // 如果找不到商品（即 result 為 null 或 undefined）
    if (!result) throw new Error('NOT FOUND')

    // 如果找到商品，則將 HTTP 狀態碼設置為 OK（200），並回傳商品資料
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無商品'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 編輯商品====================================================================
export const edit = async (req, res) => {
  try {
    // 檢查網址的 id 是否為有效的 MongoDB ID，若無效則拋出ID錯誤
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // 以ID去查商品，並更新商品資料(要查的東西,要更新的內容,要不要在更新的時候執行驗證)
    // orFail  如果ID格式不對，會拋出錯誤，並且不會執行下面的程式碼
    req.body.image = req.file?.path
    await products.findByIdAndUpdate(req.params.id, req.body, { runValidators: true }).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: ''
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無商品'
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

// 加進購物車====================================================================
