import * as api from '../../api'
import { Messages } from '@slack-archive/common'

export default class MessagesRemote extends Messages {
  async get (from, to, conversationId, postsOnly, threadTs, limit) {
    const params = {}

    if (from) {
      from.inclusive ? params.from = from.value : params.after = from.value
    }

    if (to) {
      to.inclusive ? params.to = to.value : params.before = to.value
    }

    if (conversationId) {
      params.conversationId = conversationId
    }

    if (postsOnly) {
      params.postsOnly = 'true'
    }

    if (threadTs) {
      params.thread = threadTs
    }

    if (limit) {
      params.limit = limit
    }

    return api.getMessages(params)
  }
}
