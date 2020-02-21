const axios = require('axios');
const constants = require('../../constants');
const cookie = require('cookie');
const logger = require('../../../src/util/logger').getInstance();
const jwt = require('../../util/jwt');
const qs = require('query-string');
const Response = require('../../types/Response');
const { fromAxiosError, fromSlackError, badRequest, unauthorized, internalError } = require('../../util/response');

const getAuthUrl = () => {
    const body = {
        url: constants.slack.oauthUrl,
        parameters: {
            client_id: constants.slack.clientId,
            scope: constants.slack.scope.publicMessages,
            redirect_uri: constants.slack.oauthRedirectUrl,
            team: constants.slack.teamId
        }
    };

    return new Response({ status: 200, body });
}


const login = async (request) => {
    if(typeof request.body !== 'object') {
        return badRequest("Expected body of type 'application/json'");
    }

    const verificationCode = request.body.verificationCode;

    if(typeof verificationCode !== 'string') {
        return badRequest("Missing string: verificationCode");
    }

    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });
    let response;

    try {
        response = await axiosInstance.post('/oauth.access',
            qs.stringify({
                code: verificationCode,
                redirect_uri: constants.slack.oauthRedirectUrl
            }),
            {
                headers: {
                    'Authorization': "Basic " + Buffer.from(constants.slack.clientId + ":" + constants.slack.clientSecret).toString('base64')
                }
            }
        );
    } catch(e) {
        logger.error("Slack '/oauth.access' error: " + e.message);
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
        constants.tokenSecret,
        { expiresIn: constants.loginTokenExpiry }
    );

    return new Response({
        status: 200,
        headers: {
            'Set-Cookie': cookie.serialize(
                'loginToken',
                token,
                { httpOnly: true, secure: !constants.isDevEnvironment }
            )
        },
        body: {}
    });
}

const validLogin = async (request) => {
    let loginToken;
    let accessToken;

    try {
        loginToken = cookie.parse(request.headers['Cookie']).loginToken;
        if(typeof loginToken != 'string') {
            throw new Error("Missing 'loginToken' Cookie");
        }
    } catch (e) {
        return badRequest("Missing 'loginToken' Cookie");
    }

    try {
        accessToken = jwt.verify(loginToken, constants.tokenSecret).accessToken;
        if(typeof accessToken != 'string') {
            throw new Error('Invalid login token');
        }
    } catch (e) {
        if(e instanceof jwt.TokenExpiredError) {
            const token = jwt.verify(loginToken, constants.tokenSecret, { ignoreExpiration: true }).accessToken;
            await revokeSlackToken(token);
            return unauthorized(constants.errorCodes.tokenExpired, "Login token expired");
        } else {
            return unauthorized('Invalid login token');
        }
    }


    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });
    let response;

    try {
        response = await axiosInstance.post('/auth.test', {}, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    } catch (e) {
        logger.error("Slack '/auth.test' error: " + e.message);
        logger.error(e);
        return fromAxiosError(e);
    }

    if(!response.data.ok) {
        if (['invalid_auth', 'account_inactive', 'token_revoked', 'no_permission', 'missing_scope'].indexOf(response.data.error) > -1) {
            return unauthorized("Invalid token: " + response.data.error);
        } else if (['org_login_required', 'ekm_access_denied', 'team_added_to_org', 'fatal_error'].indexOf(response.data.error) > -1) {
            return fromSlackError(response);
        } else {
            logger.error("Error trying to exchange verification code with Slack: " + response.data.error);
            return internalError("Could not obtain access token from Slack");
        }
    }

    return new Response({ status: 200 });
}


const deleteToken = async (request) => {
    const loginToken = cookie.parse(request.headers['Cookie']).loginToken;
    const accessToken = jwt.verify(loginToken, constants.tokenSecret).accessToken;

    await revokeSlackToken(accessToken);

    return new Response({ status: 200 });
}


const revokeSlackToken = async (token) => {
    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });
    try {
        await axiosInstance.get('/auth.revoke', {
            headers: {
                'Authorization': 'Bearer ' + token
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