module.exports = class Request {
    constructor(req) {
        const { headers, parameters, query, body } = req || {}
        this.headers = headers || {};
        this.parameters = parameters || {};
        this.query = query || {};
        this.body = body;
    }
}