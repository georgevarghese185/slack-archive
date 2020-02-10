const axios = require('axios');
const constants = require('../../constants');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const qs = require('query-string');
const Response = require('../../types/Response');
const { fromAxiosError, badRequest } = require('../../util/response');

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
        response = await axiosInstance.post(
            '/oauth.access',
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
                { httpOnly: true, secure: constants.isDevEnvironment }
            )
        },
        body: {}
    });
}


module.exports = {
    getAuthUrl,
    login
}