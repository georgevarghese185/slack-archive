module.exports = class Response {
    constructor({ status, headers, body }) {
        this.status = status;
        this.headers = headers || {};
        this.body = body || "";
    }
}