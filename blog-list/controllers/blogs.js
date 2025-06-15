const blogsRouter = require('express').Router()
const blog = require('./../models/blog')
const Blog = require('./../models/blog')

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

module.exports = blogsRouter