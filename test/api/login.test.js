const decache = require('decache');
const Response = require('../../src/types/Response');
const Request = require('../../src/types/Request');
const { expect } = require('chai');

module.exports = () => {
    let constants;
    let api;
    before(() => {
        process.env.SLACK_CLIENT_ID = "client id";
        process.env.SLACK_TEAM_ID = "team id";
        constants = require('../../src/constants');
        api = require('../../src/backend/api');
    });

    after(() => {
        delete process.env.SLACK_CLIENT_ID;
        delete process.env.SLACK_TEAM_ID;
        decache('../../src/constants');
        decache('../../src/backend/api');
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
}