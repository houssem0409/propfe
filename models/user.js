const mongoose = require('mongoose')
const crypto = require('crypto')
const { ObjectId } = mongoose.Schema

const { v1: uuidv1 } = require('uuid')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      unique: 32,
    },
    password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,
    role: {
      type: String,
      required: true,
      default: 'user',
    },
    startup: {
      type: ObjectId,
    },

    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
