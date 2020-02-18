const axios = require('axios');
const constants = require('../../constants');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const qs = require('query-string');
const Response = require('../../types/Response');
const { fromAxiosError, fromSlackError, badRequest, unauthorized } = require('../../util/response');

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
        return fromAxiosError(e);
    }

    if(!response.data.ok) {
        if(response.data.error === 'invalid_code') {
            return badRequest(constants.errorCodes.invalidCode, "Invalid verification code");
        } else {
            return fromSlackError(response);
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
            return unauthorized(constants.errorCodes.tokenExpired, "Login token expired");
        } else {
            return unauthorized('Invalid login token');
        }
    }


    const axiosInstance = axios.create({ baseURL: constants.slack.apiBaseUrl });

    try {
        const response = await axiosInstance.post('/auth.test', {}, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });

        if(!response.data.ok) {
            return unauthorized("Slack access token invalid: " + response.data.error);
        }
    } catch (e) {
        console.error("Slack 'auth.test' error: " + e.message);
        console.error(e);
        return fromAxiosError(e);
    }


    return new Response({ status: 200 });
}


module.exports = {
    getAuthUrl,
    login,
    validLogin
}