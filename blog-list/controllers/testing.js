const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

testingRouter.post('/reset', async (request, response) => {
  // Delete notes
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create root user
  const saltRounds = 10
  const passwordHash = await bcrypt.hash("sekret", saltRounds)

  const user = new User({
    username: "root",
    name: "Bobert Root",
    passwordHash: passwordHash,
  })
  await user.save()

  response.status(204).end()
})

module.exports = testingRouter