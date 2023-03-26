const formidable = require('formidable')
const _ = require('lodash')
const Rating = require('../models/rating')
const fs = require('fs')
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.add = (req, res) => {
  let rat = {
    startup: req.params.startupId,
    score: req.body.score,
    feedback: req.body.feedback,
    user: req.params.userId,
  }
  let rating = new Rating(rat)
  rating.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json(result)
  })
}

exports.list = (req, res) => {
  let limit = req.query.limit ? parseInt(req.body.limit) : 25
  let skip = parseInt(req.query.skip)

  const query = { startup: req.params.startupId }
  Rating.find(query)
    .skip(skip)
    .limit(limit)
    .exec((err, ratings) => {
      if (err) {
        return res.status(400).json({
          error: 'Ratings Not Found',
        })
      }
      res.json(ratings)
    })
}

exports.listBySearch = (req, res) => {
  const query = { startup: req.body.id }
  let limit = req.body.limit ? parseInt(req.body.limit) : 100
  let skip = parseInt(req.body.skip)

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  Rating.find(query)
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      console.log('this is the data value ' + data)
      if (err) {
        return res.status(400).json({
          error: 'Reviews not found',
        })
      }
      res.json({
        size: data.length,
        data,
      })
    })
}
