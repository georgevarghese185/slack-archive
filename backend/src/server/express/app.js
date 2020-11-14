const api = require('../../api')
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const { authMiddleware, contextMiddleware, delayMiddleware, errorMiddleware } = require('./middleware');
const { toRequest } = require('./util')

const routeHandler = handlerFn => async (req, resp, next) => {
    try {
        const request = toRequest(req);
        const context = req.slackArchive.context;
        const token = req.slackArchive.token;

        const response = await handlerFn(context, request, token);

        Object.keys(response.headers).forEach(key =>
            resp.set(key, response.headers[key])
        )
        resp.status(response.status)
        resp.send(response.body)
    } catch (e) {
        next(e)
    }
}

const init = async(context) => {
    const app = express();

    app.use(errorMiddleware)

    app.use(bodyParser.json());

    app.use(cors({
        origin: process.env.CORS_ALLOW_ORIGIN,
        credentials: true
    }))

    app.use(await contextMiddleware(context))

    if (context.isDevEnvironment() && process.env.TEST_API_DELAY) {
        app.use(delayMiddleware(process.env.TEST_API_DELAY))
    }

    app.get('/', (req, res) => res.send('up'));

    app.get('/v1/login/auth-url', routeHandler(api['GET:/v1/login/auth-url']))

    app.post('/v1/login', routeHandler(api['POST:/v1/login']));

    app.get('/v1/login/status', routeHandler(api['GET:/v1/login/status']));

    app.delete('/v1/login', routeHandler(api['DELETE:/v1/login']));

    app.use(authMiddleware);

    app.get('/v1/backups/stats', routeHandler(api['GET:/v1/backups/stats']));

    app.post('/v1/backups/new', routeHandler(api['POST:/v1/backups/new']));

    app.get('/v1/backups/running', routeHandler(api['GET:/v1/backups/running']));

    app.get('/v1/backups/:id', routeHandler(api['GET:/v1/backups/:id']));

    app.post('/v1/backups/:id/cancel', routeHandler(api['POST:/v1/backups/:id/cancel']));

    app.get('/v1/conversations', routeHandler(api['GET:/v1/conversations']));

    app.get('/v1/members/:id', routeHandler(api['GET:/v1/members/:id']));

    app.get('/v1/messages', routeHandler(api['GET:/v1/messages']));

    return app
}

module.exports = {
    init
}