const blogsRouter = require('express').Router()
const blog = require('./../models/blog')
const Blog = require('./../models/blog')

blogsRouter.get('/', async (request, response, next) => {
    const blogs = await Blog.find({})
    response.json(blogs)
    // Blog.find({})
    //     .then((blogs) => { response.json(blogs) })
    //     .catch(error => next(error))
})

blogsRouter.post('/', (request, response, next) => {
    const blog = new Blog(request.body)

    blog.save()
        .then((result) => { response.status(201).end() })
        .catch(error => next(error))
})

module.exports = blogsRouter