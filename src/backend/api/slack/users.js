const {getQueryString} = require('../../utils/request');
const {withRetry, paginatedRequest} = require('./utils');

const listUsers = async (fetch, token, onRateLimit) => {
  const url = 'https://slack.com/api/users.list';
  const makeRequest = (p) => {
    return withRetry(fetch, onRateLimit)(url + '?' + getQueryString(p))
  };
  const params = { token };

  const fn = async getNext => {
    const {response, next} = await getNext();
    if(response.ok) {
      const members = response.members.reduce((members, m) => {
        members[m.id] = m;
        return members;
      }, {});

      return {
        error: false,
        members,
        next: next ? () => fn(() => next()) : undefined
      }
    } else {
      return {
        error: true,
        slackError: response
      }
    }
  }

  return fn(() => paginatedRequest(makeRequest, params));
}

module.exports = {
  listUsers
}
