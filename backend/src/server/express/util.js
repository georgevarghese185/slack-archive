const Request = require('../../types/Request');

const toRequest = (req) => {
    return new Request({
        headers: req.headers,
        body: req.body,
        query: req.query,
        parameters: req.params
    })
}

const sendResponse = (response, res) => {
    Object.keys(response.headers).forEach(key =>
        res.set(key, response.headers[key])
    )
    res.status(response.status)
    res.send(response.body)
}

module.exports = {
    toRequest,
    sendResponse
}