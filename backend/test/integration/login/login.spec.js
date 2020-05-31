require('dotenv').config()
const axios = require('axios');
const constants = require('../../../src/constants')
const cookie = require('cookie')
const { expect } = require('chai')
const { getAuthUrl, login } = require('./loginHelper')

describe('Login flow', () => {
    const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}`, validateStatus: status => true })

    it('get auth URL', async() => {
        const { response } = await getAuthUrl();
        expect(response.status).to.equal(200)
        expect(response.data).to.deep.equal({
            url: `${process.env.SLACK_BASE_URL}/oauth/authorize`,
            parameters: {
                client_id: process.env.SLACK_CLIENT_ID,
                scope: constants.slack.scope.publicMessages,
                redirect_uri: process.env.OAUTH_REDIRECT_URI,
                team: process.env.SLACK_TEAM_ID
            }
        })
    })

    it('login', async() => {
        // expecting SLACK_BASE_URL to point to Mock Slack server
        const { loginCookie } = await login();

        const loginToken = cookie.parse(loginCookie).loginToken;
        expect(loginToken).not.to.be.null;
    });

    it('check login status: should be successful', async () => {
        const { loginCookie } = await login();
        const response = await axiosInstance.get('/v1/login/status', {
            headers: { 'Cookie': loginCookie }
        });

        expect(response.status).to.equal(200);
    })

    it('logout', async () => {
        const { loginCookie } = await login();

        const response = await axiosInstance.delete('/v1/login', {
            headers: { 'Cookie': loginCookie }
        });

        expect(response.status).to.equal(200);

        const response2 = await axiosInstance.get('/v1/login/status', {
            headers: { 'Cookie': loginCookie }
        });

        expect(response2.status).to.equal(401);
    });
})