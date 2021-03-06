module.exports = {
    slack: {
        scope: {
            publicMessages: "channels:history,channels:read,users:read",
            privateMessages: "channels:history,channels:read,groups:history,groups:read,im:history,im:read,mpim:history,mpim:read,users:read"
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
        backupNotFound: 'backup_not_found',
        backupInProgress: 'backup_in_progress'
    },
    loginTokenExpiry: '30 days',
}