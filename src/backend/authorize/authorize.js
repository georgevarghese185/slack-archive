const {Response, RedirectResponse} = require('../utils/response');
const {getQueryString} = require('../utils/request')
const uuid = require('uuid/v4');
const {aesEncrypt, aesDecrypt, sha256Hash} = require('../utils/secure');
const {exchangeAuthCode} = require('../api/slack/oauth');
const FrontendRoutes = require('../../frontend/routes');

const authorize = async (req, state) => {
  const slackAuthUrl = 'https://slack.com/oauth/authorize';
  const parameters = {
    client_id: state.config.app.client_id,
    scope: state.config.app.scope,
    redirect_uri: state.config.server.url + state.config.app.oauthRedirectRoute,
    team: state.config.app.team_id
  }

  const redirectUrl = slackAuthUrl + '?' + getQueryString(parameters);

  return new Response(
    200,
    { redirectUrl }
  )
}

const exchange = async (req, state) => {
  const Users = state.models.Users;
  const fetch = state.fetch;
  const codeExchangeUrl = 'https://slack.com/api/oauth.access';
  const clientId = state.config.app.client_id;
  const clientSecret = state.config.app.client_secret;
  const code = req.query.code;

  const response = await exchangeAuthCode(fetch, clientId, clientSecret, code);

  if(response.error) {
    return new Response(300, {slackError: response.slackError});
  }

  const token = uuid();
  const token_hash = sha256Hash(token);
  const encrypted_auth_token = aesEncrypt(response.accessToken, token);

  const user = await Users.findOne({where: {user_id: response.userId}});
  if(!user) {
    await Users.create({
      user_id: response.userId,
      token_hash,
      encrypted_auth_token
    });
  } else {
    await user.update({ token_hash, encrypted_auth_token });
  }

  const tokenCookie = {
    value: token,
    options: {
      httpOnly: true,
      secure: !process.env.ENV == 'development',
      maxAge: 30 * 24 * 60 * 60 * 1000
    }
  }

  return new RedirectResponse(
    state.config.server.url + '/#' + FrontendRoutes.SIGN_IN + '?success=true',
    { 'login_token': tokenCookie }
  );
}

const getUserAndAuthToken = async (token, Users) => {
  const tokenHash = sha256Hash(token);
  const user = await Users.findOne({where: {token_hash: tokenHash}});
  if(!user) {
    return {};
  } else {
    const authToken = aesDecrypt(user.encrypted_auth_token, token);
    return {user, authToken};
  }
}

module.exports = {
  authorize,
  exchange,
  getUserAndAuthToken
}
