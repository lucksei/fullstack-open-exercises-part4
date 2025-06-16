const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const bcrypt = require('bcrypt')

const app = require('../app')
const Blog = require('../models/blog')
const helpers = require('./helpers')
const _ = require('lodash')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('creating succeeds with a fresh username', async () => {
    let response = await api.get('/api/users').expect(200)
    const usersAtStart = response.body

    const newUser = {
      username: 'pperez',
      name: 'Pedrito Perez',
      password: 'messi1234'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    response = await api.get('/api/users').expect(200)

    const usersAtEnd = response.body
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const foundUser = _.find(usersAtEnd, user => user.username === "pperez")
    assert(foundUser)
    console.log(usersAtEnd)
  })
})

after(async () => {
  await mongoose.connection.close()
})