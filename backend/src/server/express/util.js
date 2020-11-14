const Request = require('../../types/Request');

const toRequest = (req) => {
    return new Request({
        headers: req.headers,
        body: req.body,
        query: req.query,
        parameters: req.params
    })
}

module.exports = {
    toRequest
}