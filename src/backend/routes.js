const {Response} = require('./utils/response')
const {authorize, exchange} = require('./authorize/authorize');
const {backup} = require('./backup/backup');
const {status} = require('./backup/status')

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
}

module.exports = setupRoutes;
