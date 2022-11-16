const axios = require('axios');
const constants = require('../constants');
const cookie = require('cookie');
const jwt = require('../util/jwt');
const qs = require('query-string');
const Response = require('../types/Response');
const { fromAxiosError, fromSlackError, badRequest, unauthorized, internalError } = require('../util/response');
const { validateSlackToken, InvalidTokenError, SlackValidationError, validateLogin, MissingTokenError, TokenParseError, ExpiredTokenError } = require('./authorize');

const getAuthUrl = async (context) => {
    const scope = process.env.EXP_PRIVATE_SCOPE === 'true'
        ? constants.slack.scope.privateMessages // for experimental use. Not officially supported yet
        : constants.slack.scope.publicMessages;

    const body = {
        url: context.getSlackBaseUrl() + '/oauth/authorize',
        parameters: {
            client_id: context.getSlackClientId(),
            scope,
            redirect_uri: context.getOauthRedirectUri(),
            team: context.getSlackTeamId()
        }
    };

    return new Response({ status: 200, body });
}


const login = async (context, request) => {
    const logger = context.getLogger();

    if(typeof request.body !== 'object') {
        return badRequest("Expected body of type 'application/json'");
    }

    const verificationCode = request.body.verificationCode;

    if(typeof verificationCode !== 'string') {
        return badRequest("Missing string: verificationCode");
    }

    const axiosInstance = axios.create({ baseURL: context.getSlackBaseUrl() });
    let response;

    try {
        response = await axiosInstance.post('/api/oauth.access',
            qs.stringify({
                code: verificationCode,
                redirect_uri: context.getOauthRedirectUri()
            }),
            {
                headers: {
                    'authorization': "Basic " + Buffer.from(context.getSlackClientId() + ":" + context.getSlackClientSecret()).toString('base64'),
                    'content-type': 'application/x-www-form-urlencoded'
                }
            }
        );
    } catch(e) {
        logger.error("Slack '/api/oauth.access' error: " + e.message);
        logger.error(e);
        return fromAxiosError(e);
    }

    if(!response.data.ok) {
        if(response.data.error === 'invalid_code') {
            return badRequest(constants.errorCodes.invalidCode, "Invalid verification code");
        } else if(response.data.error === 'code_already_used') {
            return unauthorized(constants.errorCodes.codeUsed, "Provided code has already been used before");
        } else if (['org_login_required', 'ekm_access_denied', 'team_added_to_org', 'fatal_error'].indexOf(response.data.error) > -1) {
            return fromSlackError(response);
        } else {
            logger.error("Error trying to exchange verification code with Slack: " + response.data.error);
            return internalError("Could not obtain access token from Slack");
        }
    }

    const { access_token, user_id } = response.data;
    const token = jwt.sign(
        { accessToken: access_token, userId: user_id },
        context.getAuthTokenSecret(),
        { expiresIn: constants.loginTokenExpiry }
    );

    return new Response({
        status: 200,
        headers: {
            'set-cookie': cookie.serialize(
                'loginToken',
                token,
                { httpOnly: true, secure: !context.isDevEnvironment() }
            )
        },
        body: {}
    });
}

const validLogin = async (context, request) => {
    const logger = context.getLogger();

    try {
        const token = validateLogin(context, request);
        await validateSlackToken(context, token);
    } catch (e) {
        if (e instanceof MissingTokenError) {
            return badRequest("Missing 'loginToken' Cookie");
        } else if (e instanceof InvalidTokenError || e instanceof TokenParseError) {
            return unauthorized("Invalid token: " + e.message);
        } else if (e instanceof ExpiredTokenError) {
            await revokeSlackToken(context, e.token.accessToken);
            return unauthorized(constants.errorCodes.tokenExpired, "Login token expired");
        } else if (e instanceof SlackValidationError) {
            return fromSlackError(e.response)
        } else {
            logger.error("Error trying to exchange verification code with Slack: " + e.message);
            return internalError("Could not verify access token with Slack");
        }
    }

    return new Response({ status: 200, body: {} });
}


const deleteToken = async (context, request) => {
    let loginToken;
    let accessToken;

    try {
        loginToken = cookie.parse(request.headers['cookie']).loginToken;
    } catch (e) {
        loginToken = null;
    }

    if (typeof loginToken != 'string') {
        return badRequest("Missing 'loginToken' Cookie");
    }

    try {
        accessToken = jwt.verify(loginToken, context.getAuthTokenSecret(), { ignoreExpiration: true }).accessToken;
    } catch (e) {
        return unauthorized('Invalid login token');
    }

    await revokeSlackToken(context, accessToken);

    return new Response({
        status: 200,
        headers: {
            'set-cookie': cookie.serialize(
                'loginToken',
                '',
                { httpOnly: true, secure: !context.isDevEnvironment() }
            )
        },
    });
}


const revokeSlackToken = async (context, token) => {
    const logger = context.getLogger();
    const axiosInstance = axios.create({ baseURL: context.getSlackBaseUrl() });
    try {
        await axiosInstance.post('/api/auth.revoke', {}, {
            headers: {
                'authorization': 'Bearer ' + token
            }
        });
    } catch (e) {
        logger.error("Error while revoking Slack access token: " + e.message);
        logger.error(e);
    }
}


module.exports = {
    getAuthUrl,
    login,
    validLogin,
    deleteToken
}