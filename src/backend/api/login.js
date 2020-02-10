const constants = require('../../constants');
const Response = require('../../types/Response');
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
}


module.exports = {
    getAuthUrl,
    login
}