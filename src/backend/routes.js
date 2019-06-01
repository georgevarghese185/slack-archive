const {Response} = require('./utils/response')
const {authorize, exchange, signOut} = require('./authorize/authorize');
const {backup} = require('./backup/backup');
const {status} = require('./backup/status');
const path = require('path');
const glob = require('glob');
const fs = require('fs');

const routeHandler = (handler, state) => {

  let handleRoute = async (req, res) => {
    let response = await handler(req, state);
    if(response instanceof Response) {
      response.respond(res)
    } else {
      res.json(response);
    }
  }

  return (req, res) => {
    handleRoute(req, res)
      .catch(e => {
        console.error(e)
        res.status(500);
        res.json({errorMessage: e.message});
      });
  }
}

const sendHtml = (res, state) => {
  const id = state.config.server.indexId;
  res.send(
`<html>
  <head>
    <script src='/index${id}.js'></script>
  </head>
</html>`
);
}

const setupRoutes = (app, state) => {
  app.get('/hai', (req, resp) => resp.send("hai"));
  app.get('/api/slack/OAuth/authUrl', routeHandler(authorize, state));
  app.post('/api/slack/OAuth/exchangeCode', routeHandler(exchange, state));
  app.get('/api/signOut', routeHandler(signOut, state));
  app.post('/api/slack/backup', routeHandler(backup, state));
  app.get('/api/slack/backup/status', routeHandler(status, state));

  app.get(state.config.app.oauthRedirectRoute, routeHandler(exchange, state));
  app.get('/', (req, res) => sendHtml(res, state));
  app.get('*', (req, res) => {
    if(process.env.ENV == "development" && req.url.match(/\.js$/)) {
      const webpackUrl = process.env.WEBPACK_URL || "http://localhost:8081";
      res.redirect(webpackUrl + req.url);
    } else {
      const filePath = path.join(__dirname, '../../dist' + req.url);
      fs.access(filePath, err => {
        if(err) {
          sendHtml(res, state);
        } else {
          res.sendFile(filePath);
        }
      })
    }
  });
}

module.exports = setupRoutes;
