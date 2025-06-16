const blogsRouter = require('express').Router()
const Blog = require('./../models/blog')
const User = require('./../models/user')
const logger = require('./../utils/logger')

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  // Load any user from the db as the blog creator
  const user = await User.findOne({}).sort({ field: 'asc', _id: -1 }).limit(1)
  if (!user) {
    response.status(500).json({ error: 'user missing or not valid' })
  }

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user._id,
  })


  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
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