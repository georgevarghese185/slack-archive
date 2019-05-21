const {getQueryString} = require('../../utils/request');
const {withRetry, paginatedRequest} = require('./utils');

const listUsers = async (fetch, token, onRetry) => {
  const url = 'https://slack.com/api/users.list';
  const makeRequest = (p) => {
    return withRetry(fetch, onRetry)(url + '?' + getQueryString(p))
  };
  const params = { token };

  const {response, next} = await paginatedRequest(makeRequest, params);
  if(response.ok) {
    const members = response.members.reduce((members, m) => {
      members[m.id] = m;
      return members;
    }, {});

    return {
      error: false,
      members,
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
  listUsers
}
