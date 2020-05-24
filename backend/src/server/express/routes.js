const api = require('../../api')
const Request = require('../../types/Request')


const toRequest = (req) => {
    return new Request({
        headers: req.headers,
        body: req.body,
        query: req.query,
        parameters: req.params
    })
}

const sendResponse = (resp, response) => {
    Object.keys(response.headers)
        .forEach(key => resp.set(key, response.headers[key]))
    resp.status(response.status)
    resp.send(response.body)
}

const handleError = (context, resp, e) => {
    context.getLogger().error('Error while processing request')

    resp.status(500)
    resp.send({
        errorCode: "internal_server_error",
        message: "Unexpected/unforseen error"
    })
}

const setupRoutes = (app, context) => {
    app.use((req, resp, next) => {
        resp.set('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGIN)
        resp.set('Access-Control-Allow-Headers', '*')
        next();
    })

    app.get('/', (req, resp) => resp.send('up'));

    app.get('/v1/login/auth-url', (req, resp) => {
        api['GET:/v1/login/auth-url'](context)
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    })

    app.post('/v1/login', (req, resp) => {
        api['POST:/v1/login'](context, toRequest(req))
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    })

    app.get('/v1/login/status', (req, resp) => {
        api['GET:/v1/login/status'](context, toRequest(req))
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    })

    app.delete('/v1/login', (req, resp) => {
        api['DELETE:/v1/login'](context, toRequest(req))
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    })
}

module.exports = {
    setupRoutes
}