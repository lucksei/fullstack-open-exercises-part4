const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('./../models/user')
const logger = require('./../utils/logger')
const { request } = require('express')

usersRouter.get('/', async (request, response, next) => {
    const users = await User.find({})
    response.json(users)
})
usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body

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