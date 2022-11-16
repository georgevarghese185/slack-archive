const constants = require('../../constants');
const { validateLogin, MissingTokenError } = require('../../api/authorize');
const { startBackup } = require('../../backup')
const { setupSequelize } = require('./sequelize');
const { toRequest, sendResponse } = require('./util');
const { TokenExpiredError } = require('jsonwebtoken');
const { unauthorized } = require('../../util/response');

const contextMiddleware = async (context) => {
    await setupSequelize(context);

    context.setActions({
        startBackup: (backupId, token) => startBackup(context, backupId, token)
    });

    return (req, res, next) => {
        req.slackArchive = req.slackArchive || {};
        req.slackArchive.context = context;
        next();
    }
}

const delayMiddleware = (delay) => (req, res, next) => {
    setTimeout(next, delay);
}

const authMiddleware = (req, res, next) => {
    try {
        token = validateLogin(req.slackArchive.context, toRequest(req));
        req.slackArchive.token = token;
        next();
    } catch (e) {
        if (e instanceof TokenExpiredError) {
            const response = unauthorized(constants.errorCodes.tokenExpired, "Login token expired");
            sendResponse(response, res)
        } else if (e instanceof MissingTokenError) {
            const response = unauthorized(constants.errorCodes.unauthorized, "Login token expected");
            sendResponse(response, res)
        } else {
            const response = unauthorized(constants.errorCodes.unauthorized, "Invalid token");
            sendResponse(response, res)
        }
    }
}

const errorMiddleware = (err, req, res, next) => {
    try {
        const context = req.slackArchive.context;
        context.getLogger().error('Error while processing request')
        context.getLogger().error(err)
    } catch (e) {
        console.error(err)
        console.error('Error Handler: Unable to log error with Logger')
        console.error(e)
    }

    res.status(500)
    res.send({
        errorCode: constants.errorCodes.internalError,
        message: "Unexpected error"
    })
}

module.exports = {
    contextMiddleware,
    delayMiddleware,
    authMiddleware,
    errorMiddleware
}