import { Schema, model } from 'mongoose'
const schema = new Schema({
  court: {
    type: String,
    required: [true, '場地，必填'],
    enum: {
      values: ['A', '未開放']
    },
    default: 'A'
  },
  date: {
    type: Date,
    required: [true, '日期必填']
  },
  begin: {
    type: String,
    required: [true, '開始時間必填']
  },
  end: {
    type: String,
    required: [true, '結束時間必填']
  },
  peoplenumber: {
    type: Number,
    required: [true, '開放名額，必填'],
    min: [0, '開放名額不能小於0']
  },
  height: {
    type: String,
    required: [true, '女網/男網，必填'],
    enum: {
      values: ['女網', '男網'],
      message: '請選擇女網/男網'
    }
  },
  info: {
    type: [String],
    required: [true, '說明必填'],
    enum: {
      values: ['新手友善', '男女混打', '僅限女生', '僅限男生', '宵夜場', '早場', '一般場', '高手場', '未開放', '只開放季打', '徵臨打'],
      message: '請選擇說明敘述'
    }
  },
  online: {
    type: Boolean,
    required: [true, '是否開放報名，必填'],
    default: true
  }
},
{
  timestamps: true,
  versionKey: false
})

export default model('appointments', schema)
