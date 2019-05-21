const {getQueryString} = require('../../utils/request')

const exchangeAuthCode = async (fetch, clientId, clientSecret, code) => {
  const url = 'https://slack.com/api/oauth.access';

  const parameters = {
    client_id: clientId,
    client_secret: clientSecret,
    code
  }

  const response = await (await fetch(url + '?' + getQueryString(parameters))).json();

  if(response.ok) {
    return {
      error: false,
      accessToken: response.access_token,
      userId: response.user_id
    }
  } else {
    return {
      error: true,
      slackResponse: response
    }
  }
}

module.exports = {
  exchangeAuthCode
}
