const {getQueryString, withRetry} = require('../../utils/request');

const listUsers = async (fetch, token, onRetry) => {
  const url = 'https://slack.com/api/users.list';

  const getUsers = async (nextCursor) => {
    const params = {
      token
    }

    if(nextCursor) {
      params.next_cursor = nextCursor;
    }

    const makeRequest = () => fetch(url + '?' + getQueryString(params));
    const response = await (await withRetry(makeRequest, onRetry)).json();

    if(response.ok) {
      const members = response.members.reduce((members, m) => {
        members[m.id] = m;
        return members;
      }, {});

      let next;
      if(response.response_metadata && response.response_metadata.next_cursor) {
        next = getUsers(response.response_metadata.next_cursor);
      }

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

  return await getUsers();
}

module.exports = {
  listUsers
}
