const constants = require('../../constants');
const { authorizeRequest } = require('../../api/authorize');
const { startBackup } = require('../../backup')
const { setupSequelize } = require('./sequelize');
const { toRequest } = require('./util')

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
    const token = authorizeRequest(req.slackArchive.context, toRequest(req));

    if (token == null) {
        res.status(401).send({
            errorCode: constants.errorCodes.unauthorized,
            message: "Unauthorized"
        });

        return;
    }

    req.slackArchive.token = token;

    next();
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