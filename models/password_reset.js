const mongoose = require('mongoose')
const crypto = require('crypto')
const { ObjectId } = mongoose.Schema

const { v1: uuidv1 } = require('uuid')

const password_resetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    resetString: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PasswordReset', password_resetSchema)
