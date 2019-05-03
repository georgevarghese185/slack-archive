const {Response} = require('./utils/response')
const {authorize} = require('./authorize/authorize')

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
  app.get('/authorize', routeHandler(authorize, state))
}

module.exports = setupRoutes;
