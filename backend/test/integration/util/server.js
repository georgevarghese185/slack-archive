const AppContext = require('../../../src/AppContext');
const { init } = require('../../../src/server/express/app');
const { app: mockSlackApp } = require('../../mockSlack/app');

class TestContext extends AppContext {
    getLogger() {
        return {
            log() {},
            info() {},
            error: console.error
        }
    }
}

const startServer = async () => {
    let server;
    let mockSlackServer;

    const app = (await init(new TestContext()));
    await new Promise(resolve => {
        mockSlackServer = mockSlackApp.listen(process.env.MOCK_SLACK_PORT, resolve);
    })
    await new Promise(resolve => {
        server = app.listen(process.env.PORT, resolve)
    });

    return async () => {
        await new Promise(resolve => server.close(resolve))
        await new Promise(resolve => mockSlackServer.close(resolve))
    };
}

module.exports = {
    startServer
}