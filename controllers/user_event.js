const { find } = require('lodash')
const { errorHandler } = require('../helpers/dbErrorHandler')
const { hashSync, compare, compareSync, hash } = require('bcrypt')
const UserEvent = require('../models/user_event')
const User = require('../models/user')

const { rmSync } = require('fs')
exports.participate = (req, res) => {
  const query = {
    event: req.params.eventId,
    participant: req.params.userId,
  }
  UserEvent.find(query).exec((err, resu) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    if (resu?.length < 1) {
      let ue = {
        event: req.params.eventId,
        participant: req.params.userId,
      }
      let userEvent = new UserEvent(ue)
      userEvent.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          })
        }
        res.json(result)
      })
    } else {
      res.json('you alredy participated !')
    }
  })
}

exports.list = (req, res) => {
  const query = { participant: req.params.userId }
  UserEvent.find(query).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    res.json(result)
  })
}

exports.listParticipants = (req, res) => {
  const query = { event: req.params.eventId }

  UserEvent.find(query).exec((err, result) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      })
    }
    const participants = []
    result.map((usev, e) => {
      participants.push(String(usev.participant))
      //  console.log(usev.participant)
    })
    //console.log(participants)
    let query = {}
    query.participant = participants

    console.log(query)

    User.find({ _id: { $in: participants } }).exec((err, resu) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        })
      }
      res.json(resu)
    })
  })
}
