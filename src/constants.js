module.exports = {
    slack: {
        oauthUrl: "https://slack.com/oauth/authorize",
        oauthRedirectUrl: "stub",
        apiBaseUrl: 'https://slack.com/api/',
        scope: {
            publicMessages: "channels:history,channels:read,users:read"
        },
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        teamId: process.env.SLACK_TEAM_ID
    },
    errorCodes: {
        badRequest: 'bad_request',
        slackError: 'slack_error',
        invalidCode: 'invalid_code',
        codeUsed: 'code_already_used',
        unauthorized: 'unauthorized',
        tokenExpired: 'token_expired',
        internalError: 'internal_server_error'
    },
    tokenSecret: process.env.TOKEN_SECRET,
    loginTokenExpiry: '30 days',
    isDevEnvironment: process.env.ENV == 'dev'
}