const express = require('express')
const router = express.Router()

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')

const {
  userById,
  read,
  update,
  add,
  purchaseHistory,
  listUsers,
  deleteUser,
} = require('../controllers/user')

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  })
})
router.get('/user/:userId', read)
router.get('/users', listUsers)

router.put('/user/update/:userId', update)
router.post('/user/add', add)

router.delete('/user/delete/:userId', deleteUser)

//router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory)

router.param('userId', userById)

module.exports = router
