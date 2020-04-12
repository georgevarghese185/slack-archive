const Logger = require('./util/Logger')

class AppContext {
    constructor() {
        this.models = {}
        this.actions = {}
        this.token = null
    }

    setModels(models) {
        this.models = models;
        return this;
    }

    setActions(actions) {
        this.actions = actions;
        return this;
    }

    setAuthToken(token) {
        this.token = token;
        return this;
    }

    getLogger() {
        if (!this.logger) {
            this.logger = new Logger()
        }

        return this.logger
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

    getAuthTokenSecret() {
        return process.env.TOKEN_SECRET
    }

    isDevEnvironment() {
        return process.env.ENV == 'dev'
    }
}

module.exports = AppContext
