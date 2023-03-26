const express = require('express')
const router = express.Router()

const {
  requireSignin,
  isAuth,
  isAdmin,
  verifyEmail,
  verifyPage,
  passwordReset,
  resetpass,
} = require('../controllers/auth')

const {
  userById,
  read,
  update,
  add,
  purchaseHistory,
  listUsers,
  deleteUser,
  listSearch,
  upgradeToManage,
  listMembers,
  removeMember,
  listSearchToAddMember,
} = require('../controllers/user')
const { startupById } = require('../controllers/startup')

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  })
})
router.get('/user/:userId', read)
router.get('/users', listUsers)
router.get('/members/:startupId', listMembers)
router.put('/removeMember/:userId', removeMember)

router.put('/user/update/:userId', update)
router.post('/user/add', add)
router.post('/user/search', listSearch)
router.put('/user/upgrade/:userId', upgradeToManage)

router.delete('/user/delete/:userId', deleteUser)
router.get('/user/verify/:userId/:uniqueString', verifyEmail)
//router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory)
router.post('/changePassword', resetpass)
router.post('/users/search', listSearchToAddMember)

router.get('/user/verified/:', verifyPage)
router.post('/requestPasswordReset', passwordReset)
router.param('userId', userById)
router.param('startupId', startupById)

module.exports = router
