const {getQueryString} = require('../../utils/request');
const {withRetry, paginatedRequest} = require('./utils');

const listConversations = async (fetch, token, private, onRateLimit) => {
  const url = 'https://slack.com/api/conversations.list';
  const makeRequest = (p) => {
    return withRetry(fetch, onRateLimit)(url + '?' + getQueryString(p))
  }
  const params = {
    token,
    types: private ? 'private_channel,mpim,im' : 'public_channel'
  }

  const fn = async getNext => {
    const {response, next} = await getNext();
    if(response.ok) {
      const channels = response.channels.reduce((channels, c) => {
        channels[c.id] = c;
        return channels;
      }, {});

      return {
        error: false,
        channels,
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

const getConversationHistory = async (fetch, token, channelId, onRateLimit) => {
  const url = 'https://slack.com/api/conversations.history';
  const makeRequest = (p) => {
    return withRetry(fetch, onRateLimit)(url + '?' + getQueryString(p))
  }
  const params = {
    token,
    channel: channelId
  }

  const fn = async getNext => {
    const {response, next} = await getNext();
    if(response.ok) {
      const messages = response.messages.reduce((messages, m) => {
        messages[m.ts] = m;
        return messages;
      }, {});

      return {
        error: false,
        messages,
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

const getConversationReplies = async (fetch, token, channelId, ts, onRateLimit) => {
  const url = 'https://slack.com/api/conversations.replies';
  const makeRequest = (p) => {
    return withRetry(fetch, onRateLimit)(url + '?' + getQueryString(p))
  }
  const params = {
    token,
    channel: channelId,
    ts
  }

  const fn = async getNext => {
    const {response, next} = await getNext();
    if(response.ok) {
      const messages = response.messages.reduce((messages, m) => {
        messages[m.ts] = m;
        return messages;
      }, {});

      return {
        error: false,
        messages,
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
  listConversations,
  getConversationHistory,
  getConversationReplies
}
