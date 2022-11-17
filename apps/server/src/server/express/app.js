const api = require('../../api')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const express = require('express');
const { authMiddleware, contextMiddleware, delayMiddleware, errorMiddleware } = require('./middleware');
const { toRequest, sendResponse } = require('./util');

const routeHandler = handlerFn => async (req, res, next) => {
    try {
        const request = toRequest(req);
        const context = req.slackArchive.context;
        const token = req.slackArchive.token;
        const response = await handlerFn(context, request, token);
        sendResponse(response, res);
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

    app.get('/health', (req, res) => res.send('up'));

    app.get('/v1/login/auth-url', routeHandler(api['GET:/v1/login/auth-url']))

    app.post('/v1/login', routeHandler(api['POST:/v1/login']));

    app.get('/v1/login/status', routeHandler(api['GET:/v1/login/status']));

    app.delete('/v1/login', routeHandler(api['DELETE:/v1/login']));

    const protectedRouter = express.Router();

    protectedRouter.use(authMiddleware)

    protectedRouter.get('/backups/stats', routeHandler(api['GET:/v1/backups/stats']));

    protectedRouter.post('/backups/new', routeHandler(api['POST:/v1/backups/new']));

    protectedRouter.get('/backups/running', routeHandler(api['GET:/v1/backups/running']));

    protectedRouter.get('/backups/:id', routeHandler(api['GET:/v1/backups/:id']));

    protectedRouter.post('/backups/:id/cancel', routeHandler(api['POST:/v1/backups/:id/cancel']));

    protectedRouter.get('/conversations', routeHandler(api['GET:/v1/conversations']));

    protectedRouter.get('/members/:id', routeHandler(api['GET:/v1/members/:id']));

    protectedRouter.get('/messages', routeHandler(api['GET:/v1/messages']));

    app.use('/v1', protectedRouter);

    if (process.env.STATIC_WEB_DIR) {
        app.use(express.static(process.env.STATIC_WEB_DIR));
        app.get('*', (req, res) => res.sendFile(path.resolve(process.env.STATIC_WEB_DIR, 'index.html')))
    }

    return app
}

module.exports = {
    init
}