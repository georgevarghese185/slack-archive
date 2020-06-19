/**
 * A base store object with common functionality shared by post and thread store module
 */
import MessagesRemote from '../../models/remote/Messages'

export const models = {
  remote: new MessagesRemote({ baseUrl: process.env.VUE_APP_API_BASE_URL })
}

export const MESSAGE_API_LIMIT = 50
export const MAX_MESSAGES = 200

export const baseStore = {
  state: () => ({
    list: null,
    hasOlder: false,
    hasNewer: false
  }),
  mutations: {
    clearMessages (state) {
      state.list = null
      state.hasOlder = false
      state.hasNewer = false
    },
    updateMessages (state, { messages, hasOlder, hasNewer }) {
      state.list = messages
      state.hasOlder = hasOlder
      state.hasNewer = hasNewer
    },
    prependMessages (state, { messages, hasOlder }) {
      state.list = messages.concat(state.list)
      state.hasOlder = hasOlder
    },
    appendMessages (state, { messages, hasNewer }) {
      state.list = state.list.concat(messages)
      state.hasNewer = hasNewer
    }
  },
  actions: {
    async loadOlderMessages (context, { conversationId, postsOnly, threadTs }) {
      try {
        const ts = context.state.list[0].ts

        const messages = await models.remote.get(
          null,
          { inclusive: false, value: ts },
          conversationId,
          postsOnly,
          threadTs,
          MESSAGE_API_LIMIT
        )

        context.commit('prependMessages', {
          messages,
          hasOlder: messages.length >= MESSAGE_API_LIMIT
        })
      } catch (e) {
        console.error(e)
        // TODO handle error
      }
    },
    async loadNewerMessages (context, { conversationId, postsOnly, threadTs }) {
      try {
        const list = context.state.list
        const ts = list[list.length - 1].ts

        const messages = await models.remote.get(
          { inclusive: false, value: ts },
          null,
          conversationId,
          postsOnly,
          threadTs,
          MESSAGE_API_LIMIT
        )

        context.commit('appendMessages', {
          messages,
          hasNewer: messages.length >= MESSAGE_API_LIMIT
        })
      } catch (e) {
        console.error(e)
        // TODO handle error
      }
    }
  }
}
