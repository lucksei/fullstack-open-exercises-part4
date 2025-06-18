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
const logger = require('./../utils/logger')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  // The database is cleared out at the beginning, after that we initialize it with some dummy data for the tests 
  beforeEach(async () => {
    // Reset the users
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()

    // Reset the blogs 
    await Blog.deleteMany({})
    const blogObjects = helpers.initialBlogs.map(blog => new Blog({
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes,
      user: user._id,
    }))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
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

  describe('username validation', () => {
    test('Create an user without an username', async () => {
      const newUser = {
        name: 'Evil wizard',
        password: 'evilstuff123',
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
    })

    test('Create an user with username below 3 characters long', async () => {
      const newUser = {
        username: 'ew',
        name: 'Evil wizz',
        password: 'evilstuff123'
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
    })

    test('Username is unique', async () => {
      const newUser1 = {
        username: "duplicateusertest",
        name: "Duplicato Martinez",
        password: "sameasiteverwas",
      }

      let response = await api
        .post('/api/users')
        .send(newUser1)
        .expect(201)

      const newUser2 = {
        username: "duplicateusertest",
        name: "Duplicata Martinez",
        password: "sameasiteverwas",
      }

      response = await api
        .post('/api/users')
        .send(newUser2)
        .expect(400)
    })
  })

  describe('password validation', () => {
    test('Create an user without a password', async () => {
      const newUser = {
        username: 'wizardo',
        name: 'Evilio Wizardio',
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
    })

    test('Create an user with a password less than 3 characters long', async () => {
      const newUser = {
        username: 'wizardo2',
        name: 'Evilio Wizardio',
        password: 'ew',
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})