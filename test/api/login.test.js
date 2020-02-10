const cookie = require('cookie');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const moxios = require('moxios');
const qs = require('query-string');
const Response = require('../../src/types/Response');
const Request = require('../../src/types/Request');
const { expect } = require('chai');

module.exports = () => {
    let constants;
    let api;
    before(() => {
        decache('../../src/constants');
        decache('../../src/backend/api');
        process.env.SLACK_CLIENT_ID = "client id";
        process.env.SLACK_CLIENT_SECRET = "client secret";
        process.env.SLACK_TEAM_ID = "team id";
        process.env.TOKEN_SECRET = "secret";
        constants = require('../../src/constants');
        api = require('../../src/backend/api');
    });

    after(() => {
        delete process.env.SLACK_CLIENT_ID;
        delete process.env.SLACK_CLIENT_SECRET;
        delete process.env.SLACK_TEAM_ID;
        delete process.env.TOKEN_SECRET;
    })


    describe('GET:/v1/login/auth-url', () => {

        it('get auth URL', () => {
            const response = api['GET:/v1/login/auth-url'](new Request());

            const expectedResponse = new Response({
                status: 200,
                body: {
                    url: constants.slack.oauthUrl,
                    parameters: {
                        client_id: constants.slack.clientId,
                        scope: constants.slack.scope.publicMessages,
                        redirect_uri: constants.slack.oauthRedirectUrl,
                        team: constants.slack.teamId
                    }
                }
            });

            expect(response).to.deep.equal(expectedResponse);
        });
    });



    describe('POST:/v1/login', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });


        it('sucessful login', async () => {
            const userId = "U1234";
            const accessToken = "ABC";
            const verificationCode = 'XYZ';
            const request = new Request({
                body: {
                    verificationCode
                }
            });

            moxios.stubRequest('/oauth.access', {
                status: 200,
                response: {
                    ok: true,
                    access_token: accessToken,
                    user_id: userId
                }
            });

            const response = await api['POST:/v1/login'](request);
            const slackRequest = moxios.requests.mostRecent();
            const token = cookie.parse(response.headers['Set-Cookie']).loginToken;
            const decodedToken = jwt.verify(token, constants.tokenSecret);



            const excpectedSlackBody = qs.stringify({
                code: verificationCode,
                redirect_uri: constants.slack.oauthRedirectUrl
            });
            const expectedSlackAuthorization = "Basic " + Buffer.from(constants.slack.clientId + ":" + constants.slack.clientSecret).toString('base64');

            expect(slackRequest.headers['Content-Type']).to.equal('application/x-www-form-urlencoded');
            expect(slackRequest.headers['Authorization']).to.equal(expectedSlackAuthorization);
            expect(slackRequest.config.baseURL).to.equal(constants.slack.apiBaseUrl);
            expect(slackRequest.config.data).to.equal(excpectedSlackBody);

            expect(response.status).to.equal(200);
            expect(decodedToken.userId).to.equal(userId);
            expect(decodedToken.accessToken).to.equal(accessToken);
            expect(decodedToken.exp - decodedToken.iat).to.equal(30 * 24 * 60 * 60);
        });


        it('bad request: invalid body type', async () => {
            const request = new Request({ body: "XYZ" });
            const response = await api['POST:/v1/login'](request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal("bad_request");
        });


        it('bad request: missing verification code', async () => {
            const request = new Request({});
            const response = await api['POST:/v1/login'](request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal("bad_request");
        });
    });
}