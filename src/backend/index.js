const express = require('express');

const Sequelize = require('./db/sequelize');
const Middleware = require('./middleware');
const Routes = require('./routes');

const ServerConfig = require('./config/server');
const AppConfig = require('./config/app');
const fetch = require('node-fetch');

const app = express();

const start = async (app) => {
  console.log("Setting up Sequelize");
  const {sequelize, models} = await Sequelize.setupSequelize();

  const serverConfig = await ServerConfig();
  const appConfig = AppConfig(serverConfig);

  const state = {
    models,
    config: {
      server: serverConfig,
      app: appConfig
    },
    fetch
  }

  console.log("\nSetting up Express");
  Middleware(app);
  Routes(app, state);

  console.log("\nStarting Server");
  await new Promise((resolve, reject) => {app.listen(serverConfig.port, resolve)});
  console.log("\nServer Started!");
  console.log(`\n\nListening on ${serverConfig.port}`);
}

start(app)
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
