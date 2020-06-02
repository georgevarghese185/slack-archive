const AppContext = require('../../AppContext');
const bodyParser = require('body-parser');
const express = require('express');
const { setupRoutes } = require('./routes');
const { setupSequelize } = require('./sequelize');
const { setupActions } = require('./actions');

const start = async() => {
    const app = express();
    app.use(bodyParser.json());

    const context = new AppContext();
    await setupSequelize(context);
    setupRoutes(app, context);
    setupActions(context);

    app.listen(process.env.PORT, () =>
        context.getLogger().log('Slack Archive running on port ' + process.env.PORT));
}

start().catch(console.error)