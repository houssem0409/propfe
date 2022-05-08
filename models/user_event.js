const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const user_eventSchema = new mongoose.Schema(
  {
    event: {
      type: ObjectId,
      required: true,
    },
    Creator: {
      type: ObjectId,
      required: true,
    },
    participant: {
      type: ObjectId,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('userEvent', user_eventSchema)
