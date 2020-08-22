const bodyParser = require('body-parser');
const express = require('express');
const { setupRoutes } = require('./routes');
const { setupSequelize } = require('./sequelize');
const { setupActions } = require('./actions');

const init = async(context) => {
    const app = express();
    app.use(bodyParser.json());

    await setupSequelize(context);
    setupRoutes(app, context);
    setupActions(context);

    return app
}

module.exports = {
    init
}