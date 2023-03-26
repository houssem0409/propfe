const express = require('express')
const router = express.Router()
const passport = require('passport')

const {
  MyEvents,
  create,
  eventById,
  read,
  remove,
  update,
  list,
  listLimit,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch,
} = require('../controllers/event')
const {
  requireSignin,
  isAuth,
  isAdmin,
  isDirector,
  isAdminOrDirector,
  isMember,
} = require('../controllers/auth')
const { userById } = require('../controllers/user')

router.get('/event/:eventId', read)
router.delete(
  '/event/:eventId',

  remove
)
router.put(
  '/event/:eventId',

  update
) /**done */
router.post(
  '/event/create',

  create
) /** done */
router.get('/events/:userId', MyEvents)
router.post('/events/search', listSearch)
router.get('/events/related/:productId', listRelated)
router.get(
  '/events/limit/:limit',

  listLimit
) /**done */
router.get(
  '/events',

  list
) /**done */
router.get('/events/categories', listCategories) /** done */

router.post('/events/by/search', listBySearch)

router.post('/events/by/search', listBySearch)

router.param('userId', userById)
router.param('eventId', eventById)

router.get('/event/photo/:eventId', photo)

module.exports = router
