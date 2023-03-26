const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../helpers/passport')

const { userById } = require('../controllers/user')
const { eventById } = require('../controllers/event')
const {
  participate,
  list,
  listParticipants,
} = require('../controllers/user_event')

router.post(
  '/participate/:eventId/:userId',
  passport.authenticate('jwt', { session: false }),
  participate
)
router.get('/listParticipants/:eventId', listParticipants)
router.get('/participation/:userId', list)
router.param('userId', userById)
router.param('eventId', eventById)

module.exports = router
