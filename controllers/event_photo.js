const formidable = require('formidable')
const _ = require('lodash')
const EventPhoto = require('../models/event_photo')
const fs = require('fs')
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.eventPhotoById = (req, res, next, id) => {
  EventPhoto.findById(id).exec((err, eventPhoto) => {
    if (err || !eventPhoto) {
      return res.status(400).json({
        error: 'Event Photo not found !',
      })
    }
    req.eventPhoto = eventPhoto
    next()
  })
}

exports.create = (req, res) => {
  let form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded',
      })
    }
    const { title, event } = fields
    if (!title || !event) {
      return res.status(400).json({
        error: 'All fields are required !',
      })
    }
    let eventPhoto = new EventPhoto(fields)

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image Should be less than 1mb size',
        })
      }

      eventPhoto.photo.data = fs.readFileSync(String(files.photo.filepath))
      eventPhoto.photo.contentType = files.photo.type
    }
    // console.log(startup.description)

    eventPhoto.save((err, result) => {
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

  var query = { event: req.params.eventId }

  EventPhoto.find(query)
    .select('-photo')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, eventPhotos) => {
      if (err) {
        return res.status(400).json({
          error: 'Event Photos Not Found',
        })
      }
      res.json(eventPhotos)
    })
}

exports.photo = (req, res) => {
  if (req.eventPhoto.photo.data) {
    res.set('content-Type', req.eventPhoto.photo.contentType)
    return res.send(req.eventPhoto.photo.data)
  }
  next()
}
