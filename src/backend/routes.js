const {HttpError} = require('./utils/error');

const routeHandler = (handler, state) => {

  let handleRoute = async (req, resp) => {
    let response = await handler(req, state);
    resp.json(response);
  }

  return (req, resp) => {
    handleRoute(req, resp)
      .catch(e => {
        if(e instanceof HttpError) {
          resp.status(e.code);
          resp.json({errorMessage: e.message})
        } else {
          resp.status(500);
          resp.json({errorMessage: e.message});
        }
      });
  }
}

const setupRoutes = (app, state) => {
  app.get('/hai', (req, resp) => resp.send("hai"));
}

module.exports = setupRoutes;
