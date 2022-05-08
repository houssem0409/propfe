const express = require('express')
const router = express.Router()
const passport = require('passport')

const {
  create,
  list,
  eventPhotoById,
  photo,
} = require('../controllers/event_photo')
const { eventById } = require('../controllers/event')
const {
  requireSignin,
  isAuth,
  isAdmin,
  isDirector,
  isAdminOrDirector,
  isMember,
} = require('../controllers/auth')
const { userById } = require('../controllers/user')

router.post(
  '/event/photo/add',

  create
)
router.get('/photo/event/:eventPhotoId', photo)
router.get('/event/:eventId/photos', list)

router.param('userId', userById)
router.param('eventId', eventById)
router.param('eventPhotoId', eventPhotoById)

module.exports = router
