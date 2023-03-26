const express = require('express')
const router = express.Router()
const passport = require('passport')

const { add, list, listBySearch } = require('../controllers/rating')
const { userById } = require('../controllers/user')
const { startupById } = require('../controllers/startup')

router.post(
  '/ratings/:userId/:startupId',

  add
)
router.get('/ratings/startup/:startupId', list)
router.post('/ratings/bysearch', listBySearch)

router.param('userId', userById)
router.param('startupId', startupById)

module.exports = router
