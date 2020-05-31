const cookie = require('cookie');
const jwt = require('../util/jwt');

/**
 * Checks if the given request is authorized and returns the decrypted token
 * object. Returns null if failed.
 *
 * @param {Request} request The incoming request that is expected to have authorization
 * @returns {Object|null} Returns the decrypted token object if authorized or null
 * if not authorized
 */
const authorizeRequest = (context, request) => {
    const logger = context.getLogger();
    const requestCookie = request.headers['cookie'];
    let loginToken;

    if (!requestCookie) {
        logger.error('No cookie in request');
        return null;
    }

    try {
        loginToken = cookie.parse(requestCookie).loginToken;
    } catch (e) {
        logger.error('Error parsing token cookie');
        logger.error(e);
        return null;
    }

    if (!loginToken) {
        logger.error('Missing login token in cookie');
        return null;
    }

    try {
        const token = jwt.verify(loginToken, context.getAuthTokenSecret());
        return token;
    } catch (e) {
        logger.error('Error verifying login JWT');
        logger.error(e);
        return null;
    }
}

module.exports = {
    authorizeRequest
}