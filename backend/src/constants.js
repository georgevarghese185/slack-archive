module.exports = {
    slack: {
        oauthUrl: "https://slack.com/oauth/authorize",
        apiBaseUrl: 'https://slack.com/api',
        scope: {
            publicMessages: "channels:history,channels:read,users:read"
        }
    },
    errorCodes: {
        badRequest: 'bad_request',
        slackError: 'slack_error',
        invalidCode: 'invalid_code',
        codeUsed: 'code_already_used',
        unauthorized: 'unauthorized',
        tokenExpired: 'token_expired',
        internalError: 'internal_server_error',
        notFound: 'not_found',
        conversationNotFound: 'conversation_not_found',
        memberNotFound: 'member_not_found',
        threadNotFound: 'thread_not_found',
        backupNotFound: 'backup_not_found'
    },
    loginTokenExpiry: '30 days',
}