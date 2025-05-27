const morgan = require('morgan')

const morganLogger = morgan((tokens, request, response) => {
    return [
        tokens.method(request, response),
        tokens.url(request, response),
        tokens.status(request, response),
        tokens.res(request, response, 'content-length'), '-',
        tokens['response-time'](request, response), 'ms',
        JSON.stringify(request.body),
    ].join(' ')
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
    logger.log(error.message)

    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        response.status(400).json({ error: error.message })
    }
    next(error)
}

module.exports = { morganLogger, unknownEndpoint, errorHandler }