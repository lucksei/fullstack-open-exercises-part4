const blogsRouter = require('express').Router()
const { request } = require('../app')
const blog = require('./../models/blog')
const Blog = require('./../models/blog')
const logger = require('./../utils/logger')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes
  })


  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (exeption) {
    next(exeption)
  }
})

blogsRouter.delete('/:blogId', async (request, response, next) => {
  const { blogId } = request.params
  try {
    await Blog.findByIdAndDelete(blogId)
    response.status(204).end()
  } catch (exeption) {
    next(exeption)
  }
})

module.exports = blogsRouter