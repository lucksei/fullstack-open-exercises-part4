const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('./../models/user')
const logger = require('./../utils/logger')
const { request } = require('express')

usersRouter.get('/', async (request, response, next) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})
usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if (!password) {
    response.status(400).json({ error: '"password" is required' })
  }

  if (password.length <= 3) {
    response.status(400).json({ error: "password must be at least 3 characters long" })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username: username,
    name: name,
    passwordHash: passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter