const api = require('../../api')
const constants = require('../../constants');
const cors = require('cors');
const Request = require('../../types/Request')
const { authorizeRequest } = require('../../api/authorize');


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
    context.getLogger().error(e)

    resp.status(500)
    resp.send({
        errorCode: constants.errorCodes.internalError,
        message: "Unexpected/unforseen error"
    })
}

const authMiddleware = (context) => (req, resp, next) => {
    const token = authorizeRequest(context, toRequest(req));

    if (token == null) {
        resp.status(401).send({
            errorCode: constants.errorCodes.unauthorized,
            message: "Unauthorized"
        });

        return;
    }

    req.token = token;

    next();
}

const setupRoutes = (app, context) => {
    app.use(cors({
        origin: process.env.CORS_ALLOW_ORIGIN,
        credentials: true
    }))

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

    app.use(authMiddleware(context));

    app.get('/v1/backup/stats', (req, resp) => {
        api['GET:/v1/backup/stats'](context, toRequest(req))
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    })

    app.post('/v1/backup', (req, resp) => {
        api['POST:/v1/backup'](context, toRequest(req), req.token)
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    });

    app.get('/v1/backup/:id', (req, resp) => {
        api['GET:/v1/backup/:id'](context, toRequest(req))
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    });

    app.get('/v1/conversations', (req, resp) => {
        api['GET:/v1/conversations'](context)
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    });

    app.get('/v1/members/:id', (req, resp) => {
        api['GET:/v1/members/:id'](context, toRequest(req))
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    });

    app.get('/v1/messages', (req, resp) => {
        api['GET:/v1/messages'](context, toRequest(req))
            .then(response => sendResponse(resp, response))
            .catch(e => handleError(context, resp, e));
    });
}

module.exports = {
    setupRoutes
}