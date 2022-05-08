const formidable = require('formidable')
const _ = require('lodash')
const StartupPhoto = require('../models/startup_photo')
const fs = require('fs')
const { errorHandler } = require('../helpers/dbErrorHandler')
const startup = require('../models/startup')
const { startupById } = require('../controllers/startup')

exports.startupPhotoById = (req, res, next, id) => {
  StartupPhoto.findById(id).exec((err, startupPhoto) => {
    if (err || !startupPhoto) {
      return res.status(400).json({
        error: 'Startup Photo not found !',
      })
    }
    req.startupPhoto = startupPhoto
    next()
  })
}

exports.create = (req, res) => {
  let form = new formidable.IncomingForm()
  console.log(form)
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded',
      })
    }
    const { title, startup } = fields
    if (!title || !startup) {
      return res.status(400).json({
        error: 'All fields are required !',
      })
    }
    let startupPhoto = new StartupPhoto(fields)

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image Should be less than 1mb size',
        })
      }

      startupPhoto.photo.data = fs.readFileSync(String(files.photo.filepath))
      startupPhoto.photo.contentType = files.photo.type
    }

    startupPhoto.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(result)
    })
  })
}
exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.query.limit ? parseInt(req.query.limit) : 9

  var query = { startup: req.params.startupId }

  StartupPhoto.find(query)
    .select('-photo')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, startupPhotos) => {
      if (err) {
        return res.status(400).json({
          error: 'Startup Photos Not Found',
        })
      }
      res.json(startupPhotos)
    })
}

exports.update = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded',
      })
    }
    const { title, startup } = fields
    if (!title || !startup) {
      return res.status(400).json({
        error: 'All fields are required !',
      })
    }
    let startupPhoto = new StartupPhoto(fields)
    startupPhoto = _.extend(startupPhoto, fields)

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image Should be less than 1mb size',
        })
      }
      startupPhoto.photo.data = fs.readFileSync(String(files.photo.filepath))
      startupPhoto.photo.contentType = files.photo.type
    }
    startupPhoto.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error),
        })
      }
      res.json(result)
    })
  })
}

exports.remove = (req, res) => {
  let startupPhoto = req.startupPhoto
  startupPhoto.remove((err, deletedStartupPhoto) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json({
      message: 'Startup Photo deleted Seccussfuly !',
    })
  })
}

exports.photo = (req, res) => {
  if (req.startupPhoto.photo.data) {
    res.set('content-Type', req.startupPhoto.photo.contentType)
    return res.send(req.startupPhoto.photo.data)
  }
  next()
}
