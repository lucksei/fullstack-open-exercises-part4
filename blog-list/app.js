const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

// Helpers
const config = require('./utils/config')
const logger = require('./utils/logger')

// Custom middleware
const middleware = require('./utils/middleware')

// Routers
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

logger.info('connecting to MongoDB')

mongoose.connect(config.MONGODB_URI)
  .then(() => { logger.info('connected to MongoDB') })
  .catch((error) => { logger.debug('error connecting to MongoDB:', error.message) })

app.use(cors()) // Add middleware for cors
app.use(express.json()) // Add middleware to parse the body of the request
app.use(middleware.morganLogger) // Add middleware for logging
app.use(middleware.tokenExtractor) // Middleware for token extraction

app.use('/api/blogs', middleware.userExtractor, blogsRouter) // Add route for blogs controllers (includes the userExtractor middleware too)
app.use('/api/users', usersRouter) // Add route for users controllers
app.use('/api/login', loginRouter) // Add route for login controllers

if (process.env.NODE_ENV === 'test') {
  console.log("Warning: Tesing endpoints are active, this can be potentially dangerous")
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter) // Add route for testing controllers
}

app.use(middleware.unknownEndpoint) // Middleware for unknown endpoint
app.use(middleware.errorHandler) // Middleware for error handling

module.exports = app