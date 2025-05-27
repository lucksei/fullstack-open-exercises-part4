const _ = require('lodash')
const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((maxLikesBlog, blog) => {
        if (!maxLikesBlog) return blog
        return blog.likes > maxLikesBlog.likes ? blog : maxLikesBlog
    }, undefined)
}

const mostBlogs = (blogs) => {
    const countBy = _.countBy(blogs, "author")
    return Object.keys(countBy).reduce((a, b) => countBy[a] > countBy[b] ? a : b)
}

const mostLikes = (blogs) => {
    const groupBy = _.groupBy(blogs, "author")
    const authorLikes = Object.keys(groupBy).map((obj) => {
        return {
            author: obj,
            likes: _.sumBy(groupBy[obj], "likes"),
        }
    })
    return authorLikes.reduce((a, b) => a.likes > b.likes ? a : b)
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }