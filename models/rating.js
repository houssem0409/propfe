const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
    },

    startup: {
      type: ObjectId,
    },
    score: {
      type: Number,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('rating', ratingSchema)
