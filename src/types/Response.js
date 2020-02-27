/**
 * Represents an HTTP Response
 */
class Response {
    /**
     * Creates a Response object
     *
     * @param {Object} resp - The response
     * @param {number} resp.status - The response status code
     * @param {Map<string, string>} [resp.headers] - Response headers
     * @param {(string|Object)} [resp.body] - Response body. Can be a string or
     * a JSON object
     */
    constructor(resp) {
        const { status, headers, body } = resp;
        this.status = status;
        this.headers = headers || {};
        this.body = body || "";
    }
}

module.exports = Response;