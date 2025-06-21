const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('./../models/blog')
const User = require('./../models/user')
const logger = require('./../utils/logger')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {

  if (!request.user) {
    return response.status(401).json({ error: 'user missing or not valid' })
  }

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: request.user._id,
  })

  try {
    const savedBlog = await blog.save()
    request.user.blogs = request.user.blogs.concat(savedBlog._id)
    await request.user.save()
    response.status(201).json(await savedBlog.populate('user'))
  } catch (exeption) {
    next(exeption)
  }
})

blogsRouter.delete('/:blogId', async (request, response, next) => {
  const { blogId } = request.params

  if (!request.user) {
    return response.status(401).json({ error: 'user missing or not valid' })
  }

  try {
    const blogToDelete = await Blog.findById(blogId)
    if (request.user._id.toString() !== blogToDelete.toJSON().user.toString()) {
      return response.status(401).json({ error: "cannot delete another user's note" })
    }

    await Blog.findByIdAndDelete(blogId)
    return response.status(204).end()
  } catch (exeption) {
    next(exeption)
  }
})

blogsRouter.patch('/:blogId', async (request, response, next) => {
  const { blogId } = request.params

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes
  })

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, request.body, { new: true, runValidators: true })
    response.status(204).end()
  } catch (exeption) {
    next(exeption)
  }
})
module.exports = blogsRouter