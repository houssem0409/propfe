const formidable = require('formidable')
const _ = require('lodash')
const Event = require('../models/event')
const fs = require('fs')
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.eventById = (req, res, next, id) => {
  Event.findById(id).exec((err, event) => {
    if (err || !event) {
      return res.status(400).json({
        error: 'Event not found !',
      })
    }
    req.event = event
    next()
  })
}
exports.read = (req, res) => {
  return res.json(req.event)
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
    const {
      title,
      description,
      country,
      city,
      address,
      creator,
      start_date,
      end_date,
    } = fields
    if (
      !title ||
      !description ||
      !country ||
      !address ||
      !creator ||
      !city ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        error: 'All fields are required !',
      })
    }
    let event = new Event(fields)

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image Should be less than 1mb size',
        })
      }
      event.photo.data = fs.readFileSync(String(files.photo.filepath))
      event.photo.contentType = files.photo.type
    }

    event.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(result)
    })
  })
}
exports.remove = (req, res) => {
  let event = req.event
  event.remove((err, deletedEvent) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json({
      message: 'Event deleted Seccussfuly !',
    })
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
    const { title, description, country, address } = fields
    if (!title || !description || !country || !address) {
      return res.status(400).json({
        error: 'All fields are required !',
      })
    }
    let event = req.event
    event = _.extend(event, fields)

    if (files.photo) {
      console.log('this is the path ' + files.photo.filepath)

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image Should be less than 1mb size',
        })
      }
      event.photo.data = fs.readFileSync(String(files.photo.filepath))
      event.photo.contentType = files.photo.type
    }
    event.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(error),
        })
      }
      res.json(result)
    })
  })
}

/**
 * sell /arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent , then all products are returned
 */
exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.params.limit ? parseInt(req.params.limit) : 10

  console.log(limit)
  console.log('this')
  Event.find()
    .select('-photo')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, events) => {
      if (err) {
        return res.status(400).json({
          error: 'Event Not Found',
        })
      }
      res.json(events)
    })
}

exports.listLimit = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.params.limit ? parseInt(req.params.limit) : 10

  console.log(limit)
  console.log('this')
  Event.find()
    .select('-photo')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, events) => {
      if (err) {
        return res.status(400).json({
          error: 'Event Not Found',
        })
      }
      res.json(events)
    })
}
/**
 * it will find the products based on the req products category
 * other products that has the same category , will be returned
 */
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6
  Event.find({ _id: { $ne: req.event }, category: req.event.category })
    .limit(limit)
    .exec((err, events) => {
      if (err) {
        return res.status(400).json({
          error: 'Event Not Found',
        })
      }
      res.json(events)
    })
}
exports.listCategories = (req, res) => {
  Event.distinct('category', {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: 'Events not found',
      })
    }
    res.json(categories)
  })
}

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */

// route - make sure its post

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : 'desc'
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id'
  let limit = req.body.limit ? parseInt(req.body.limit) : 100
  let skip = parseInt(req.body.skip)
  let findArgs = {}

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    console.log('the key is ' + key)
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        }
      } else {
        findArgs[key] = req.body.filters[key]
      }
    }
  }

  Event.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      console.log('this is the data value ' + data)
      if (err) {
        return res.status(400).json({
          error: 'Events not found',
        })
      }
      res.json({
        size: data.length,
        data,
      })
    })
}

exports.photo = (req, res) => {
  if (req.event.photo.data) {
    res.set('content-Type', req.event.photo.contentType)
    return res.send(req.event.photo.data)
  }
  next()
}

exports.listSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {}

  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' }
    // assigne category value to query.category
    if (req.query.category && req.query.category != 'All') {
      query.category = req.query.category
    }

    Event.find(query, (err, events) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(events)
    }).select('-photo')
  }
}
exports.MyEvents = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.query.limit ? parseInt(req.query.limit) : 9

  const query = { creator: req.params.userId }
  Event.find(query)
    .select('-photo')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, events) => {
      if (err) {
        return res.status(400).json({
          error: 'Events Not Found',
        })
      }
      res.json(events)
    })
}

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : 'desc'
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id'
  let limit = req.body.limit ? parseInt(req.body.limit) : 100
  let skip = parseInt(req.body.skip)
  let findArgs = {}

  console.log(order, sortBy, limit, skip, req.body.filters)
  console.log('findArgs', findArgs)

  for (let key in req.body.filters) {
    console.log('the key is ' + key)
    if (req.body.filters[key].length > 0) {
      findArgs[key] = req.body.filters[key]
    }
  }

  Event.find(findArgs)
    .select('-photo')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Event not found',
        })
      }
      res.json({
        size: data.length,
        data,
      })
    })
}
