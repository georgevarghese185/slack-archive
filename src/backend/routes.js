const {Response} = require('./utils/response')
const {authorize, exchange} = require('./authorize/authorize');
const {backup} = require('./backup/backup');
const {status} = require('./backup/status');
const path = require('path');

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

const setupRoutes = (app, state) => {
  app.get('/hai', (req, resp) => resp.send("hai"));
  app.get('/api/slack/OAuth/authUrl', routeHandler(authorize, state));
  app.post('/api/slack/OAuth/exchangeCode', routeHandler(exchange, state));
  app.post('/api/slack/backup', routeHandler(backup, state));
  app.get('/api/slack/backup/status', routeHandler(status, state));
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../../dist/index.html')));
  app.get('*', (req, res) => {
    if(process.env.ENV == "development") {
      const webpackUrl = process.env.WEBPACK_URL || "http://localhost:8081";
      res.redirect(webpackUrl + req.url);
    } else {
      res.redirect('/')
    }
  });
}

module.exports = setupRoutes;
