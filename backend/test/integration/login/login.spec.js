require('dotenv').config()
const axios = require('axios');
const constants = require('../../../src/constants')
const cookie = require('cookie')
const qs = require('query-string');
const { expect } = require('chai')

describe('Login flow', () => {
    const axiosInstance = axios.create({ baseURL: `http://localhost:${process.env.PORT}`, validateStatus: status => true })

    // helper function for getting auth URL from slack archive (assumes Mock Slack server is being used)
    const getAuthUrl = async () => {
        const response = await axiosInstance.get('/v1/login/auth-url');
        return {
            response,
            url: response.data.url,
            params: response.data.params
        }
    }

    // helper function for logging into slack archive (assumes Mock Slack server is being used)
    const login = async () => {
        const { url, params } = await getAuthUrl();
        const { data: redirect } = await axios.get(url, {
            params,
            validateStatus: (status) => status === 302
        });
        const { query: { code } } = qs.parseUrl(redirect);

        const response = await axiosInstance.post('/v1/login', { verificationCode: code });
        const loginCookie = response.headers['set-cookie'][0];

        return { response, loginCookie }
    }

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

        console.log(response.data)

        expect(response.status).to.equal(200);
    })

    it('logout')

    it('check login status: should be unauthorized')
})