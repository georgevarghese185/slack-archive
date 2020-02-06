module.exports = {
    slack: {
        oauthUrl: "https://slack.com/oauth/authorize",
        oauthRedirectUrl: "stub",
        scope: {
            publicMessages: "channels:history,channels:read,users:read"
        },
        clientId: process.env.SLACK_CLIENT_ID,
        teamId: process.env.SLACK_TEAM_ID
    }
}