const express = require('express');

const Sequelize = require('./db/sequelize');
const Middleware = require('./middleware');
const Routes = require('./routes');

const app = express();

const start = async (app) => {
  console.log("Setting up Sequelize");
  const {sequelize, models} = await Sequelize.setupSequelize();

  const port = process.env.PORT || 4000;

  console.log("\nSetting up Express");
  Middleware(app);
  Routes(app, {sequelize, models});

  console.log("\nStarting Server");
  await new Promise((resolve, reject) => {app.listen(port, resolve)});
  console.log("\nServer Started!");
  console.log(`\n\nListening on ${port}`);
}

start(app)
  .catch(e => {
    console.error(`\n\nFAILED TO START SERVER: ${e.toString()}`);
  });
