const api = require('../../../src/api');
const AppContext = require('../../../src/AppContext')
const constants = require('../../../src/constants');
const cookie = require('cookie');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const jwt = require('../../../src/util/jwt');
const moxios = require('moxios');
const qs = require('query-string');
const Request = require('../../../src/types/Request');
const Response = require('../../../src/types/Response');

chai.use(chaiAsPromised);

describe('Login APIs', () => {
    class MockContext extends AppContext {
        getLogger() {
            return { log: () => {}, warn: () => {}, error: () => {} }
        }

        getOauthRedirectUri() {
            return "http://localhost:8080/redirect"
        }

        getSlackClientId() {
            return "client id"
        }

        getSlackClientSecret() {
            return "client secret"
        }

        getSlackTeamId() {
            return "team id"
        }

        getAuthTokenSecret() {
            return "secret"
        }

        isDevEnvironment() {
            return false
        }
    }


    describe('GET:/v1/login/auth-url', () => {

        it('get auth URL', () => {
            const context = new MockContext()
            const response = api['GET:/v1/login/auth-url'](context, new Request());

            const expectedResponse = new Response({
                status: 200,
                body: {
                    url: constants.slack.oauthUrl,
                    parameters: {
                        client_id: context.getSlackClientId(),
                        scope: constants.slack.scope.publicMessages,
                        redirect_uri: context.getOauthRedirectUri(),
                        team: context.getSlackTeamId()
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

            const context = new MockContext()
            const response = await api['POST:/v1/login'](context, request);
            const slackRequest = moxios.requests.mostRecent();
            const token = cookie.parse(response.headers['Set-Cookie']).loginToken;
            const decodedToken = jwt.verify(token, context.getAuthTokenSecret());



            const excpectedSlackBody = qs.stringify({
                code: verificationCode,
                redirect_uri: context.getOauthRedirectUri()
            });
            const expectedSlackAuthorization = "Basic " + Buffer.from(context.getSlackClientId() + ":" + context.getSlackClientSecret()).toString('base64');

            expect(slackRequest.config.method).to.equal('post');
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
            const context = new MockContext()
            const request = new Request({ body: "XYZ" });
            const response = await api['POST:/v1/login'](context, request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal("bad_request");
        });


        it('bad request: missing verification code', async () => {
            const context = new MockContext()
            const request = new Request({});
            const response = await api['POST:/v1/login'](context, request);

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

            const context = new MockContext()
            const response = await api['POST:/v1/login'](context, request);

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

            const context = new MockContext()
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

                    const response = await api['POST:/v1/login'](context, request);

                    expect(response.status, `Incorrect status for '${slackErrorCode}'`)
                        .to.equal(e.expectedResponse.status);
                    expect(response.body.errorCode, `Incorrect errorCode for '${slackErrorCode}'`)
                        .to.equal(e.expectedResponse.errorCode);
                }
            }
        });
    });



    describe('GET:/v1/login/status', () => {
        beforeEach(() => {
            moxios.install();
        });

        afterEach(() => {
            moxios.uninstall();
        });

        it('valid login token', async () => {
            const context = new MockContext();
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken },
                context.getAuthTokenSecret(),
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

            const response = await api['GET:/v1/login/status'](context, request);

            const slackRequest = moxios.requests.mostRecent();

            expect(slackRequest.config.method).to.equal('post');
            expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
            expect(response.status).to.equal(200);
        });


        it('bad request: missing token', async () => {
            const context = new MockContext()
            const request = new Request();
            const response = await api['GET:/v1/login/status'](context, request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal('bad_request');
        });


        it('unauthorized: invalid token', async () => {
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', 'not a JWT')
                }
            });

            const context = new MockContext()
            const response = await api['GET:/v1/login/status'](context, request);

            expect(response.status).to.equal(401);
            expect(response.body.errorCode).to.equal('unauthorized');
        });


        it('unauthorized: expired token', async () => {
            const context = new MockContext()
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken },
                context.getAuthTokenSecret(),
                { expiresIn: '0 ms' }
            );
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', token)
                }
            });

            const makeRequest = async () => {
                const response = await api['GET:/v1/login/status'](context, request);
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
            const context = new MockContext();
            const token = jwt.sign(
                { accessToken: "XYZ" },
                context.getAuthTokenSecret(),
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

                    const response = await api['GET:/v1/login/status'](context, request);

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
            const context = new MockContext()
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken: "XYZ" },
                context.getAuthTokenSecret(),
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

            const response = await api['DELETE:/v1/login'](context, request);
            const slackRequest = moxios.requests.mostRecent();

            expect(slackRequest.config.method).to.equal('post');
            expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
            expect(response.status).to.equal(200);
        });


        it('expired token', async () => {
            const context = new MockContext();
            const accessToken = "XYZ";
            const token = jwt.sign(
                { accessToken },
                context.getAuthTokenSecret(),
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

            const response = await api['DELETE:/v1/login'](context, request);
            const slackRequest = moxios.requests.mostRecent();

            expect(response.status).to.equal(200);
            expect(slackRequest.headers['Authorization']).to.equal(`Bearer ${accessToken}`);
        });


        it('bad request: missing token', async () => {
            const context = new MockContext();
            const request = new Request();
            const response = await await api['DELETE:/v1/login'](context, request);

            expect(response.status).to.equal(400);
            expect(response.body.errorCode).to.equal('bad_request');
        });


        it('unauthorized: invalid token', async () => {
            const context = new MockContext();
            const request = new Request({
                headers: {
                    'Cookie': cookie.serialize('loginToken', 'not a token')
                }
            });

            const response = await api['DELETE:/v1/login'](context, request);

            expect(response.status).to.equal(401);
            expect(response.body.errorCode).to.equal('unauthorized');
        });
    });
})