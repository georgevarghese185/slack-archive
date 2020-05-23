require('dotenv').config()
const AppContext = require('../../AppContext');
const bodyParser = require('body-parser');
const express = require('express');
const { setupRoutes } = require('./routes');

const start = async() => {
    const app = express();
    app.use(bodyParser.json());

    const context = new AppContext();
    setupRoutes(app, context);

    app.listen(process.env.PORT, () =>
        context.getLogger().log('Server started on port ' + process.env.PORT));
}

start().catch(console.error)