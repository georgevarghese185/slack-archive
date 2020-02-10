module.exports = {
    slack: {
        oauthUrl: "https://slack.com/oauth/authorize",
        oauthRedirectUrl: "stub",
        scope: {
            publicMessages: "channels:history,channels:read,users:read"
        },
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        teamId: process.env.SLACK_TEAM_ID
    },
    tokenSecret: process.env.TOKEN_SECRET
}