const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const event_photoSchema = new mongoose.Schema(
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
    event: {
      type: ObjectId,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('EventPhoto', event_photoSchema)
