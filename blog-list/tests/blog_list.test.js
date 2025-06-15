const {test, after, beforeEach} = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const app = require('../app')
const Blog = require('../models/blog')
const _ = require('lodash')

const api = supertest(app)

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
  {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
  },
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  }
]

// The database is cleared out at the beginning, after that we save
// two notes stored in the initialBlogs array to the database.
beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
    await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('verify that the unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
        // console.log(Object.keys(blog).includes("id"))
        assert(Object.keys(blog).includes("id"))
    })
})

test('verify that making a POST request to /api/blogs creates a new blog post', async () => {
    const newBlog = {
        title: "New test blog",
        author: "D",
        url: "https://localhost/",
        likes: 999,
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/)
    
    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)

    assert.strictEqual(response.body.length, initialBlogs.length + 1)
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
        .expect(400)
})

after(async () => {
    await mongoose.connection.close()
})