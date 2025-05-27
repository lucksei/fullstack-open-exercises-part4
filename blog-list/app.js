const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const blogsRouter = require('./controllers/blogs')

const app = express()

logger.info('connecting to MongoDB')

mongoose.connect(config.MONGODB_URI)
    .then(() => { logger.info('connected to MongoDB') })
    .catch((error) => { logger.debug('error connecting to MongoDB:', error.message) })

app.use(cors()) // Add middleware for cors
app.use(express.json()) // Add middleware to parse the body of the request
app.use(middleware.morganLogger) // Add middleware for logging

app.use('/api/blogs', blogsRouter) // Add route for blogs controllers

app.use(middleware.unknownEndpoint) // Middleware for unknown endpoint
app.use(middleware.errorHandler) // Middleware for error handling

module.exports = app