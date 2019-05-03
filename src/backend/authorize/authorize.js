const {Response} = require('../utils/response');
const uuid = require('uuid/v4');

const authorize = async (req, state) => {
  const slackAuthUrl = 'https://slack.com/oauth/authorize';
  const parameters = {
    client_id: state.config.app.client_id,
    scope: state.config.app.scope,
    redirect_uri: state.config.app.oauthRedirectUrl,
    team: state.config.app.team_id
  }

  const redirectUrl = slackAuthUrl + '?' + Object.keys(parameters)
    .map(key => `${key}=${encodeURIComponent(parameters[key])}`)
    .join("&")

  const token = uuid();

  const tokenCookie = {
    value: token,
    options: {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }

  return new Response(
    200,
    { redirectUrl },
    { 'token': tokenCookie }
  )
}

module.exports = {
  authorize
}
