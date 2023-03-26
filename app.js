const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const expressValidator = require('express-validator')
require('dotenv').config()
require('./helpers/passport')

const passport = require('passport')

// import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const startupRoutes = require('./routes/startup')
const categoryRoutes = require('./routes/category')
const startup_photoRoutes = require('./routes/startup_photo')
const eventRoutes = require('./routes/event')
const event_photoRoutes = require('./routes/event_photo')
const ratingRoutes = require('./routes/rating')
const user_eventRoutes = require('./routes/user_event')

//app
const app = express()

// db
const URI = process.env.MONGO_URI

mongoose.connect(
  URI,
  {
    //useCreatendex: true,
    //useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err
    console.log('Connected to MongoDB!!!')
  }
)
// middlewares

app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(expressValidator())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(passport.initialize())

// routes middleware

app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', startupRoutes)
app.use('/api', categoryRoutes)
app.use('/api', startup_photoRoutes)
app.use('/api', eventRoutes)
app.use('/api', event_photoRoutes)
app.use('/api', ratingRoutes)
app.use('/api', user_eventRoutes)

const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})
