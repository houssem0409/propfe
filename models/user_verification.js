const mongoose = require('mongoose')
const crypto = require('crypto')
const { ObjectId } = mongoose.Schema

const { v1: uuidv1 } = require('uuid')

const user_verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    uniqueString: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('UserVerification', user_verificationSchema)
