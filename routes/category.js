const express = require('express')
const router = express.Router()

const {
  create,
  categoryById,
  read,
  update,
  remove,
  list,
} = require('../controllers/category')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const category = require('../models/category')

router.get('/category/:categoryId', read)

router.post('/category/create', create)

router.put(
  '/category/:categoryId',

  update
)

router.delete(
  '/category/:categoryId',

  remove
)
router.get('/categories', list)

router.param('categoryId', categoryById)

router.param('userId', userById)

module.exports = router
