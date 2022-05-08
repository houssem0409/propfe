const { find } = require('lodash')
const { errorHandler } = require('../helpers/dbErrorHandler')
const { hashSync, compare, compareSync, hash } = require('bcrypt')

const User = require('../models/user')

//user By Id controller ************************************************
exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'user not found ',
      })
    }
    req.profile = user
    next()
  })
}
// listUser Controller **********************************************************
exports.listUsers = (req, res) => {
  User.find().exec((err, users) => {
    if (err || !users) {
      return res.status(400).json({
        error: 'users not found ',
      })
    }
    return res.json(users)
  })
}
// Update User Contoller **********************************************************
exports.update = (req, res) => {
  let user = {
    username: req.body.username,
    email: req.body.email,
    password: hashSync(req.body.password, 10),
    startup: req.body.startup,
    role: req.body.role,
  }

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: user },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: 'You are not authoraized to perform this action !',
        })
      }
      //user.hashed_password = undefined
      user.salt = undefined
      res.json(user)
    }
  )
}
exports.add = (req, res) => {
  req.body.password = hashSync(req.body.password, 10)
  let user = new User(req.body)

  user.save((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json(result)
  })
}
// delete user Controller ******************

exports.deleteUser = (req, res) => {
  User.findOneAndDelete({ _id: req.profile._id }, (err, user) => {
    if (err) {
      return res.status(400).json({
        error: 'You are not authoraized to perform this action !',
      })
    }
    user.hashed_password = undefined
    user.salt = undefined
    res.json('user deleted with success')
  })
}
//**************************************************************************************************** */
exports.read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

exports.addOrderToUserHistory = (req, res, next) => {
  let history = []
  req.body.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: req.body.transaction_id,
      amount: req.body.amount,
    })
  })
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: 'Could not update user purchase history',
        })
      }
      next()
    }
  )
}

exports.purchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate('user', '_id name')
    .sort('-created')
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(orders)
    })
}
