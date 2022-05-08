const formidable = require('formidable')
const _ = require('lodash')
const Startup = require('../models/startup')
const fs = require('fs')
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.startupById = (req, res, next, id) => {
  Startup.findById(id)
    .populate('category')
    .exec((err, startup) => {
      if (err || !startup) {
        return res.status(400).json({
          error: 'Startup not found !',
        })
      }
      req.startup = startup
      next()
    })
}
exports.read = (req, res) => {
  return res.json(req.startup)
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
    const { name, description, email, category, country, address } = fields
    if (!name || !description || !email || !category || !country || !address) {
      return res.status(400).json({
        error: 'All fields are required !',
      })
    }
    let startup = new Startup(fields)

    console.log('files values')
    console.log(files)
    if (files.photo) {
      console.log('this is the path ' + files.photo.filepath)

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image Should be less than 1mb size',
        })
      }
      startup.photo.data = fs.readFileSync(String(files.photo.filepath))
      console.log(files.photo.originalFilename)
      startup.photo.contentType = files.photo.type
      console.log(files.photo.type)
    }
    console.log(startup.name)
    console.log(startup.description)
    console.log(startup.country)
    console.log(startup.address)
    console.log(startup.email)

    startup.save((err, result) => {
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
  let startup = req.startup
  startup.remove((err, deletedStartup) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json({
      message: 'Startup deleted Seccussfuly !',
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
    const { name, description, email, category, country, address } = fields
    if (!name || !description || !email || !category || !country || !address) {
      return res.status(400).json({
        error: 'All fields are required !',
      })
    }
    let startup = req.startup
    startup = _.extend(startup, fields)

    if (files.photo) {
      console.log('this is the path ' + files.photo.filepath)

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image Should be less than 1mb size',
        })
      }
      startup.photo.data = fs.readFileSync(String(files.photo.filepath))
      startup.photo.contentType = files.photo.type
    }
    startup.save((err, result) => {
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
  let limit = req.query.limit ? parseInt(req.query.limit) : 10

  Startup.find()
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, startups) => {
      if (err) {
        return res.status(400).json({
          error: 'Startup Not Found',
        })
      }
      res.json(startups)
    })
}
/**
 * it will find the products based on the req products category
 * other products that has the same category , will be returned
 */
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6
  Startup.find({ _id: { $ne: req.startup }, category: req.startup.category })
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, startups) => {
      if (err) {
        return res.status(400).json({
          error: 'Startup Not Found',
        })
      }
      res.json(startups)
    })
}
exports.listCategories = (req, res) => {
  Startup.distinct('category', {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: 'Startup not found',
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

  Startup.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Startups not found',
        })
      }
      res.json({
        size: data.length,
        data,
      })
    })
}

exports.photo = (req, res) => {
  if (req.startup.photo.data) {
    res.set('content-Type', req.startup.photo.contentType)
    return res.send(req.startup.photo.data)
  }
  next()
}

exports.listSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {}

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' }
    // assigne category value to query.category
    if (req.query.category && req.query.category != 'All') {
      query.category = req.query.category
    }

    Startup.find(query, (err, startups) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(startups)
    }).select('-photo')
  }
}
