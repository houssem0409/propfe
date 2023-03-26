const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const startupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    email: {
      type: String,
    },

    category: {
      type: ObjectId,
      ref: 'Category',
      default: null,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
      default: null,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    logo: {
      type: String,
    },
    year_founded: {
      type: Number,
    },
    employee_range: {
      type: String,
    },
    total_fundings: {
      type: Number,
      default: null,
    },
    lat: {
      type: String,
      default: 10,
    },
    lng: {
      type: String,
      default: 10,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Startup', startupSchema)
