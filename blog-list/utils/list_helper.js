const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((maxLikesBlog, blog) => {
        if (!maxLikesBlog) return blog
        return blog.likes >= maxLikesBlog.likes ? blog : maxLikesBlog
    }, undefined)
}

module.exports = { dummy, totalLikes, favoriteBlog }