const Logger = require('./util/Logger')

class AppContext {
    constructor() {
        this.models = {}
        this.actions = {}
    }

    setModels(models) {
        this.models = models;
        return this;
    }

    setActions(actions) {
        this.actions = actions;
        return this;
    }

    getLogger() {
        if (!this.logger) {
            this.logger = new Logger()
        }

        return this.logger
    }

    getSlackBaseUrl() {
        return process.env.SLACK_BASE_URL;
    }

    getSlackTeamId() {
        return process.env.SLACK_TEAM_ID;
    }

    getSlackClientId() {
        return process.env.SLACK_CLIENT_ID;
    }

    getSlackClientSecret() {
        return process.env.SLACK_CLIENT_SECRET;
    }

    getOauthRedirectUri() {
        return process.env.OAUTH_REDIRECT_URI;
    }

    getAuthTokenSecret() {
        return process.env.TOKEN_SECRET
    }

    isDevEnvironment() {
        return process.env.ENV == 'dev'
    }
}

module.exports = AppContext
