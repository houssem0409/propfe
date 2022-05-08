const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../helpers/passport')

const {
  signup,
  signin,
  signout,
  requireSignin,
  protected,
  refresh,
} = require('../controllers/auth')

router.post('/refresh', refresh)
router.post('/signup', signup)
router.post('/signin', signin)
router.get('/signout', signout)
router.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  protected
)

router.get('/hello', requireSignin, (req, res) => {
  res.send('hello there ')
})

module.exports = router
