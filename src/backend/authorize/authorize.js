const {Response} = require('../utils/response');
const {getQueryString} = require('../utils/request')
const uuid = require('uuid/v4');
const {aesEncrypt} = require('../utils/secure');
const {exchangeAuthCode} = require('../api/slack/oauth');

const authorize = async (req, state) => {
  const slackAuthUrl = 'https://slack.com/oauth/authorize';
  const parameters = {
    client_id: state.config.app.client_id,
    scope: state.config.app.scope,
    redirect_uri: state.config.app.oauthRedirectUrl,
    team: state.config.app.team_id
  }

  const redirectUrl = slackAuthUrl + '?' + getQueryString(parameters);

  const token = uuid();

  const tokenCookie = {
    value: token,
    options: {
      httpOnly: true,
      secure: !process.env.ENV == 'development',
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }

  return new Response(
    200,
    { redirectUrl },
    { 'token': tokenCookie }
  )
}

const exchange = async (req, state) => {
  const Users = state.models.Users;
  const fetch = state.fetch;
  const token = req.cookies.token;
  const codeExchangeUrl = 'https://slack.com/api/oauth.access';
  const clientId = state.config.app.client_id;
  const clientSecret = state.config.app.client_secret;
  const code = req.body.code;

  const response = await exchangeAuthCode(fetch, clientId, clientSecret, code);

  if(response.error) {
    return new Response(300, {slackError: response.slackError});
  }

  const encrypted_auth_token = aesEncrypt(response.accessToken, token);

  const user = await Users.findOne({where: {user_id: response.userId}});
  if(!user) {
    await Users.create({
      user_id: response.userId,
      encrypted_auth_token
    });
  } else {
    await user.update({ encrypted_auth_token });
  }

  return new Response(200, {status: 'success'});
}

module.exports = {
  authorize,
  exchange
}
