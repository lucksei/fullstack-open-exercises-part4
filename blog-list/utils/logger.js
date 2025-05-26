const info = (...params) => {
    console.log(...params)
}

const error = (...params) => {
    console.error(...params)
}

const debug = (...params) => {
    console.debug(...params)
}

MediaSourceHandle.exports = { info, error, debug }