const axios = require('axios');
const cookie = require('cookie');
const jwt = require('../util/jwt');

class MissingTokenError extends Error {
    constructor(message) {
        super(message);
    }
}

class TokenParseError extends Error {
    constructor(e) {
        super(e)
    }
}

class ExpiredTokenError extends Error {
    constructor(e, token) {
        super(e);
        this.token = token;
    }
}

class InvalidTokenError extends Error {
    constructor(e) {
        super(e);
    }
}

class SlackValidationError extends Error {
    constructor(axiosResponse) {
        super(axiosResponse.message);
        this.response = axiosResponse;
    }
}

/**
 * Checks if the given request is authorized and returns the decrypted token
 * object. Returns null if failed.
 *
 * @param {Request} request The incoming request that is expected to have authorization
 * @returns {Object|null} Returns the decrypted token object if authorized or null
 * if not authorized
 */
const validateLogin = (context, request) => {
    const logger = context.getLogger();
    const requestCookie = request.headers['cookie'];

    if (!requestCookie) {
        logger.error('No cookie in request');
        throw new MissingTokenError("Missing 'loginToken' Cookie");
    }

    const { loginToken } = cookie.parse(requestCookie);

    if (!loginToken) {
        logger.error("Missing 'loginToken' Cookie");
        throw new MissingTokenError("Missing 'loginToken' Cookie");
    }

    try {
        const token = jwt.verify(loginToken, context.getAuthTokenSecret());
        return token;
    } catch (e) {
        logger.error(e);

        if (e instanceof jwt.TokenExpiredError) {
            logger.error('JWT expired');
            const token = jwt.verify(loginToken, context.getAuthTokenSecret(), { ignoreExpiration: true });
            throw new ExpiredTokenError(e, token);
        }

        throw new TokenParseError(e);
    }
}

const validateSlackToken = async (context, loginToken) => {
    const logger = context.getLogger();
    const { accessToken } = loginToken;

    const axiosInstance = axios.create({ baseURL: context.getSlackBaseUrl() });
    let response;

    try {
        response = await axiosInstance.post('/api/auth.test', {}, {
            headers: {
                'authorization': 'Bearer ' + accessToken
            }
        });
    } catch (e) {
        logger.error("Slack '/api/auth.test' error: " + e.message);
        logger.error(e);
        throw new SlackValidationError(response);
    }

    if(!response.data.ok) {
        if (['invalid_auth', 'account_inactive', 'token_revoked', 'no_permission', 'missing_scope'].indexOf(response.data.error) > -1) {
            throw new InvalidTokenError(response.data.error)
        } else if (['org_login_required', 'ekm_access_denied', 'team_added_to_org', 'fatal_error'].indexOf(response.data.error) > -1) {
            throw new SlackValidationError(response)
        } else {
            logger.error("Error trying to exchange verification code with Slack: " + response.data.error);
            throw new SlackValidationError(response)
        }
    }
}

module.exports = {
    validateLogin,
    validateSlackToken,
    MissingTokenError,
    TokenParseError,
    ExpiredTokenError,
    InvalidTokenError,
    SlackValidationError
}