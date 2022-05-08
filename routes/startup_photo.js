const express = require('express')
const router = express.Router()
const passport = require('passport')

const {
  photo,
  remove,
  update,
  create,
  list,
  startupPhotoById,
} = require('../controllers/startup_photo')
const {
  requireSignin,
  isAuth,
  isAdmin,
  isDirector,
  isAdminOrDirector,
  isMember,
} = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { startupById } = require('../controllers/startup')

router.post(
  '/startup/photo/add',

  create
)
router.get('/photo/startup/:startupPhotoId', photo)
router.put('/startup/:startupId/photo/:startupPhotoId', update)
router.get('/startup/:startupId/photos', list)

router.delete('/startup-photo/:startupPhotoId', remove)

router.param('startupPhotoId', startupPhotoById)
router.param('satrtupId', startupById)
router.param('userId', userById)

module.exports = router
