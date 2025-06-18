const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const bcrypt = require('bcrypt')

const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helpers = require('./helpers')
const _ = require('lodash')
const jwt = require('jsonwebtoken')

const api = supertest(app)

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

describe('GET operations on /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, helpers.initialBlogs.length)
  })

  test('verify that the unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
      // console.log(Object.keys(blog).includes("id"))
      assert(Object.keys(blog).includes("id"))
    })
  })
})


describe('POST operations on /api/blogs', async () => {
  // Generate a token to test out the app
  let testToken = ''
  beforeEach(async () => {
    const newUser = await User.findOne({ username: 'root' })
    testToken = jwt.sign(newUser.toJSON(), process.env.SECRET)
  })

  test('making a POST request without the Authorization header returns code 401', async () => {
    const newBlog = {
      title: "New test blog",
      author: "D",
      url: "https://localhost/",
      likes: 999,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/)
  })

  test('making a POST request with a non-valid Authorization header returns code 401', async () => {
    const newBlog = {
      title: "New test blog",
      author: "D",
      url: "https://localhost/",
      likes: 999,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', 'Bearer wrongtokenhere')
      .expect(401)
      .expect("Content-Type", /application\/json/)
  })

  test('making a POST request to /api/blogs creates a new blog post', async () => {
    const newBlog = {
      title: "New test blog",
      author: "D",
      url: "https://localhost/",
      likes: 999,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)

    assert.strictEqual(response.body.length, helpers.initialBlogs.length + 1)
    assert(titles.includes("New test blog"))
  })

  test('verify that if the "likes" property is missing from the POST request, it will default to the valie 0', async () => {
    const newBlog = {
      title: "Missing likes property",
      author: "D",
      url: "https://localhost/",
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const response = await api.get('/api/blogs')
    const lastBlogSaved = _.find(response.body, blog => blog.title === "Missing likes property")

    assert(Object.keys(lastBlogSaved).includes("likes"))

  })

  test('verify that if the "title" property is missing from the POST request, it will return with code 400', async () => {
    const newBlog = {
      author: "D",
      url: "https://localhost/",
      likes: 9,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(400)
  })

  test('verify that if the "url" property is missing from the POST request, it will return with code 400', async () => {
    const newBlog = {
      title: "Missing URL",
      author: "D",
      likes: 9,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(400)
  })
})

describe('DELETE operations on /api/blogs', () => {
  // Generate a token to test out the app
  let testToken = ''
  beforeEach(async () => {
    // Load token into testToken var
    const newUser = await User.findOne({ username: 'root' })
    testToken = jwt.sign(newUser.toJSON(), process.env.SECRET)

    // Create a dummy blog in the database with the new user's id
    const newBlog = new Blog({
      title: "Cool blog, totally not for deleting later",
      author: "A special person",
      url: "https://localhost.com/",
      likes: 0,
      user: newUser._id,
    })
    await newBlog.save()
  })

  test('deleting a blog without the authorization header results in error 401', async () => {
    let response = await api
      .get('/api/blogs')
      .expect(200)

    const blogToDelete = _.find(response.body, blog => blog.title === "Cool blog, totally not for deleting later")
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)
  })

  test('deleting a blog with a malformed authorization results in code 401', async () => {
    let response = await api
      .get('/api/blogs')
      .expect(200)

    const blogToDelete = _.find(response.body, blog => blog.title === "Cool blog, totally not for deleting later")
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'Bearer malformedtoken')
      .expect(401)
  })

  test('deleting a blog results in code 204 and the blog no longer exists', async () => {
    let response = await api
      .get('/api/blogs')
      .expect(200)

    const blogToDelete = _.find(response.body, blog => blog.title === "Cool blog, totally not for deleting later")
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(204)

    response = await api
      .get('/api/blogs')
      .expect(200)
    const blogDeleted = _.find(response.body, blog => blog.title === "Cool blog, totally not for deleting later")
    assert(!blogDeleted)
  })
})

describe('UPDATE operations on /api/blogs', () => {
  test('verify that updating the "likes" of a blog results in code 204 and the blog changes', async () => {
    let response = await api
      .get('/api/blogs')
      .expect(200)
    const blogToUpdate = _.find(response.body, blog => blog.title === "Canonical string reduction")

    await api
      .patch(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 42 })
      .expect(204)

    response = await api
      .get('/api/blogs')
      .expect(200)
    const blogUpdated = _.find(response.body, blog => blog.title === "Canonical string reduction")
    assert.strictEqual(blogUpdated.likes, 42)
  })
})

after(async () => {
  await mongoose.connection.close()
})