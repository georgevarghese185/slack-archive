import axios from 'axios'
import Messages from '../../../../backend/src/models/Messages'

export default class MessagesRemote extends Messages {
  constructor ({ baseUrl }) {
    super()
    this.baseUrl = baseUrl
  }

  async get (from, to, conversationId, postsOnly, threadTs, limit) {
    const axiosInstance = axios.create({ baseURL: this.baseUrl })

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

    const response = await axiosInstance.get('/v1/messages', { params })

    return response.data.messages
  }
}
