const morgan = require('morgan');
const jsonParser = require('body-parser').json();
const cookieParser = require('cookie-parser')();
const urlEncodedParser = require('body-parser').urlencoded();
const express = require('express');

const requestLogger = (req, resp, next) => {
  console.log(`\n\nRequest body:\n\n${JSON.stringify(req.body, null, 2)}\n\n`);
  next();
}

const setupMiddleware = (app, serverConfig) => {
  app.use(morgan('dev'));
  app.use(cookieParser);
  app.use(jsonParser);
  app.use(urlEncodedParser);
  app.use(requestLogger);
}

module.exports = setupMiddleware
