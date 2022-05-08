const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const startup_photoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 32,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    startup: {
      type: ObjectId,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('StartupPhoto', startup_photoSchema)
