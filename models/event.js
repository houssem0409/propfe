const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    creator: {
      type: ObjectId,
      default: null,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Event', eventSchema)
