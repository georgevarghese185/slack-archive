const {getQueryString} = require('../../utils/request');
const {withRetry, paginatedRequest} = require('./utils');

const listConversations = async (fetch, token, private, onRetry) => {
  const url = 'https://slack.com/api/conversations.list';
  const makeRequest = (p) => {
    return withRetry(fetch, onRetry)(url + '?' + getQueryString(p))
  }
  const params = {
    token,
    types: private ? 'private_channel,mpim,im' : 'public_channel'
  }

  const {response, next} = await paginatedRequest(makeRequest, params);
  if(response.ok) {
    const channels = response.channels.reduce((channels, c) => {
      channels[c.id] = c;
      return channels;
    }, {});

    return {
      error: false,
      channels,
      next
    }
  } else {
    return {
      error: true,
      slackError: response
    }
  }
}

module.exports = {
  listConversations
}
