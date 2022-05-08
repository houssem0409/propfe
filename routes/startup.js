const express = require('express')
const router = express.Router()
const passport = require('passport')

const {
  create,
  startupById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch,
} = require('../controllers/startup')
const {
  requireSignin,
  isAuth,
  isAdmin,
  isDirector,
  isAdminOrDirector,
  isMember,
} = require('../controllers/auth')
const { userById } = require('../controllers/user')

router.get('/startup/:startupId', read) /**done */
router.delete(
  '/startup/:startupId',

  remove
) /**done */
router.put(
  '/startup/:startupId',

  update
) /**done */
router.post(
  '/startup/create',

  create
) /** done */

router.post('/startups/search', listSearch) /**done */
router.get('/startups/related/:productId', listRelated)
router.get(
  '/startups',

  list
) /**done */
router.get('/startups/categories', listCategories) /** done */

router.post('/startups/by/search', listBySearch)

router.param('userId', userById) /**done */
router.param('startupId', startupById) /**done */

router.get('/startup/photo/:startupId', photo) /**done */

module.exports = router
