/**
 * Represents an HTTP Request
 */
class Request {
    /**
     * Creates a Request object
     *
     * @param {Object} [req] - The request parameters
     * @param {Map<string, string>} [req.headers] - The request headers
     * @param {Map<string, string>} [req.parameters] - URL parameters (eg: '/:param')
     * @param {Map<string, string>} [req.query] - Optional query string parameters
     * @param {(string|Object)} [req.body] - The request body. Can be a string
     * or a JSON object
     */
    constructor(req = {}) {
        const { headers, parameters, query, body } = req;
        this.headers = headers || {};
        this.parameters = parameters || {};
        this.query = query || {};
        this.body = body;
    }
}

module.exports = Request;