const UserModel = require('../models/user')
const jwt = require('jsonwebtoken') //to generate signed token
const jwt_decode = require('jwt-decode')
const expressJwt = require('express-jwt') // for authorization check
const { hashSync, compare, compareSync } = require('bcrypt')
const passport = require('passport')
const User = require('../models/user')
const moment = require('moment')
require('../helpers/passport')
const { errorHandler } = require('../helpers/dbErrorHandler')
let refreshTokens = []

exports.signup = (req, res) => {
  const user = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: hashSync(req.body.password, 10),
    role: req.body.role,
  })
  user
    .save()
    .then((user) => {
      res.send({
        success: true,
        message: 'user created successfuly ',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      })
    })
    .catch((err) => {
      res.send({
        success: false,
        message: 'Some think went wrong ! ',
        error: err,
      })
    })
}

exports.signin = (req, res) => {
  UserModel.findOne({ username: req.body.username }).then((user) => {
    if (!user) {
      return res.status(401).send({
        success: false,
        message: 'Could Not Find This User ! ',
      })
    }
    if (!compareSync(req.body.password, user.password)) {
      return res.status(401).send({
        success: false,
        message: 'Incoorect Password  ! ',
      })
    }
    const payload = {
      username: user.username,
      email: user.email,
      id: user._id,
      role: user.role,
    }
    const refresh = jwt.sign(payload, 'random', { expiresIn: '1m' })
    const token = jwt.sign(payload, 'Random String', { expiresIn: '90m' })
    refreshTokens.push(refresh)
    return res.status(200).send({
      success: true,
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      message: 'Logged in Successfuly !  ',
      token: 'Bearer ' + token,
      refresh: refresh,
      expireIn: moment().add(90, 'minutes').format('hh:mm:ss A'),
    })
  })
}
exports.protected = (req, res) => {
  console.log('I am here')
  var token = req.headers.authorization
  console.log(token)
  console.log('yes')

  var decoded = jwt_decode(token)

  console.log('this is ')
  console.log(decoded)

  var query = { _id: decoded.id }
  User.find(query).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'user not found ',
      })
    }
    req.profile = user
    console.log(user)
    res.json(user[0])
  })
}
exports.signout = (req, res) => {
  res.clearCookie('t')
  res.json({ message: 'Signout Success' })
}

exports.requireSignin = expressJwt({
  secret: 'Random String',
  algorithms: ['HS256'], // added later
  userProperty: 'auth',
})

exports.isAuth = (req, res, next) => {
  let user = req.profile && req.auth && req.profile._id == req.auth._id
  if (!user) {
    return res.status(403).json({
      error: 'Access denied',
    })
  }
  next()
}

exports.isAdmin = (req, res, next) => {
  var token = req.rawHeaders[1]
  console.log(token)
  var decoded = jwt_decode(token)
  console.log('this is ')
  console.log(decoded)
  if (decoded.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin resourse ! Access denied',
    })
  }
  next()
}
exports.isDirector = (req, res, next) => {
  var token = req.rawHeaders[1]
  console.log(token)
  var decoded = jwt_decode(token)
  console.log('this is ')
  console.log(decoded)
  if (decoded.role !== 'director') {
    return res.status(403).json({
      error: ' Director Ressource ! Access denied',
    })
  }
  next()
}

exports.isAdminOrDirector = (req, res, next) => {
  var token = req.rawHeaders[1]
  console.log(token)
  var decoded = jwt_decode(token)
  console.log('this is ')
  console.log(decoded)
  if (decoded.role !== 'admin' || decoded.role !== 'director') {
    return res.status(403).json({
      error: 'Admin resourse ! Access denied',
    })
  }
  next()
}
exports.isMember = (req, res, next) => {
  var token = req.rawHeaders[1]
  console.log(token)
  var decoded = jwt_decode(token)
  console.log('this is ')
  console.log(decoded)
  if (decoded.role !== 'member') {
    return res.status(403).json({
      error: 'Member resourse ! Access denied',
    })
  }
  next()
}

exports.refresh = (req, res, next) => {
  const refreshToken = req.body.refresh
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.json({ message: 'Refresh token not found, login again' })
  }

  // If the refresh token is valid, create a new accessToken and return it.

  jwt.verify(refreshToken, 'random', (err, user) => {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }
    console.log(user)
    if (!err) {
      const token =
        'Bearer ' +
        jwt.sign(payload, 'Random String', {
          expiresIn: '90m',
        })
      const refresh = jwt.sign(payload, 'random', {
        expiresIn: '60m',
      })
      refreshTokens.push(refresh)

      return res.json({
        success: true,
        token,
        refresh,
        expireIn: moment().add(90, 'minutes').format('hh:mm:ss A'),
      })
    } else {
      return res.json({
        success: false,
        message: 'Invalid refresh token',
      })
    }
  })
}
