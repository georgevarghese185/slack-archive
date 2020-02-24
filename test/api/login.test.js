const cookie = require('cookie');
const decache = require('decache');
const jwt = require('../../src/util/jwt');
const logger = require('../../src/util/logger');
const moxios = require('moxios');
const qs = require('query-string');
const Response = require('../../src/types/Response');
const Request = require('../../src/types/Request');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

module.exports = () => {
    let constants;
    let api;
    before(() => {
        logger.createInstance({ testMode: true });
        decache('../../src/constants');
        decache('../../src/backend/api');
        process.env.ENV = "prod";
        process.env.SLACK_CLIENT_ID = "client id";
        process.env.SLACK_CLIENT_SECRET = "client secret";
        process.env.SLACK_TEAM_ID = "team id";
        process.env.TOKEN_SECRET = "secret";
        constants = require('../../src/constants');
        api = require('../../src/backend/api');
    });

    after(() => {
        delete process.env.ENV;
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
            expect(response.headers['Set-Cookie']).to.match(/Secure/);
            expect(response.headers['Set-Cookie']).to.match(/HttpOnly/);
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


        it('bad request: invalid verification code', async () => {
            const request = new Request({ body: { verificationCode: "XYZ" } });

            moxios.stubRequest('/oauth.access', {
                status: 200,
                response: {
                    okay: false,
                    error: "invalid_code"
                }
            });

            const response = await api['POST:/v1/login'](request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal("invalid_code");
        });


        it('slack error handling', async () => {
            const slackErrors = [
                {
                    slackCodes: ['invalid_code'],
                    expectedResponse: { status: 400, errorCode: 'invalid_code' }
                },
                {
                    slackCodes: ['code_already_used'],
                    expectedResponse: { status: 401, errorCode: 'code_already_used' }
                },
                {
                    slackCodes: ['org_login_required', 'ekm_access_denied', 'team_added_to_org', 'fatal_error'],
                    expectedResponse: { status: 502, errorCode: 'slack_error' }
                },
                {
                    slackCodes: ['*'], // any other error
                    expectedResponse: { status: 500, errorCode: 'internal_server_error' }
                }
            ];

            const request = new Request({
                body: { verificationCode: "XYZ" }
            });

            for (const e of slackErrors) {
                for (const slackErrorCode of e.slackCodes) {
                    moxios.stubs.reset();
                    moxios.stubRequest('/oauth.access', {
                        status: 200,
                        response: { ok: false, error: slackErrorCode }
                    });

                    const response = await api['POST:/v1/login'](request);

                    expect(response.status, `Incorrect status for '${slackErrorCode}'`)
                        .to.equal(e.expectedResponse.status);
                    expect(response.body.errorCode, `Incorrect errorCode for '${slackErrorCode}'`)
                        .to.equal(e.expectedResponse.errorCode);
                }
            }
        });
    });



    describe('GET:/v1/login', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });

        it('valid login token', async () => {
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken },
                constants.tokenSecret,
                { expiresIn: constants.loginTokenExpiry }
            );
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', token)
                }
            });

            moxios.stubRequest('/auth.test', {
                status: 200,
                response: {
                    ok: true
                }
            });

            const response = await api['GET:/v1/login'](request);

            const slackRequest = moxios.requests.mostRecent();

            expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
            expect(response.status).to.equal(200);
        });


        it('bad request: missing token', async () => {
            const request = new Request();
            const response = await api['GET:/v1/login'](request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal('bad_request');
        });


        it('unauthorized: invalid token', async () => {
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', 'not a JWT')
                }
            });

            const response = await api['GET:/v1/login'](request);

            expect(response.status).to.equal(401);
            expect(response.body.errorCode).to.equal('unauthorized');
        });


        it('unauthorized: expired token', async () => {
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken },
                constants.tokenSecret,
                { expiresIn: '0 ms' }
            );
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', token)
                }
            });

            const makeRequest = async () => {
                const response = await api['GET:/v1/login'](request);
                const slackRequest = moxios.requests.mostRecent();

                expect(response.status).to.equal(401);
                expect(response.body.errorCode).to.equal('token_expired');
                expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
            }

            moxios.stubRequest('/auth.revoke', {
                status: 200,
                response: {
                    ok: true
                }
            });

            await makeRequest();

            // Run again but this time, /auth.revoke will return an error.
            moxios.stubs.reset();
            moxios.stubRequest('/auth.revoke', {
                status: 200,
                response: {
                    ok: false,
                    error: 'invalid_auth'
                }
            });

            await expect(makeRequest(), "Should not have failed even if '/auth.revoke' failed").to.be.fulfilled;
        });


        it('slack error handling', async () => {
            const token = jwt.sign(
                { accessToken: "XYZ" },
                constants.tokenSecret,
                { expiresIn: constants.loginTokenExpiry }
            );
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', token)
                }
            });
            const slackErrors = [
                {
                    slackCodes: ['invalid_auth', 'account_inactive', 'token_revoked', 'no_permission', 'missing_scope'],
                    expectedResponse: { status: 401, errorCode: 'unauthorized' }
                },
                {
                    slackCodes: ['org_login_required', 'ekm_access_denied', 'team_added_to_org', 'fatal_error'],
                    expectedResponse: { status: 502, errorCode: 'slack_error' }
                },
                {
                    slackCodes: ['*'], // any other error
                    expectedResponse: { status: 500, errorCode: 'internal_server_error' }
                }
            ];

            for (const e of slackErrors) {
                for (const slackErrorCode of e.slackCodes) {
                    moxios.stubs.reset();
                    moxios.stubRequest('/auth.test', {
                        status: 200,
                        response: { ok: false, error: slackErrorCode }
                    });

                    const response = await api['GET:/v1/login'](request);

                    expect(response.status, `Incorrect status for '${slackErrorCode}'`)
                        .to.equal(e.expectedResponse.status);
                    expect(response.body.errorCode, `Incorrect errorCode for '${slackErrorCode}'`)
                        .to.equal(e.expectedResponse.errorCode);
                }
            }
        });
    });



    describe('DELETE:/v1/login', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });


        it('delete token', async() => {
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken: "XYZ" },
                constants.tokenSecret,
                { expiresIn: constants.loginTokenExpiry }
            );
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', token)
                }
            });

            moxios.stubRequest('/auth.revoke', {
                status: 200,
                response: {
                    ok: true
                }
            });

            const response = await api['DELETE:/v1/login'](request);
            const slackRequest = moxios.requests.mostRecent();

            expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
            expect(response.status).to.equal(200);
        });


        it('expired token', async () => {
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken },
                constants.tokenSecret,
                { expiresIn: '0 ms' }
            );
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', token)
                }
            });

            moxios.stubRequest('/auth.revoke', {
                status: 200,
                response: {
                    ok: true
                }
            });

            const response = await api['DELETE:/v1/login'](request);
            const slackRequest = moxios.requests.mostRecent();

            expect(response.status).to.equal(200);
            expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        });


        it('bad request: missing token', async () => {
            const request = new Request();
            const response = await await api['DELETE:/v1/login'](request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal('bad_request');
        });
    });
}