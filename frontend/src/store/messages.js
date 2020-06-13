import MessagesRemote from '../models/remote/Messages'

const models = {
  remote: new MessagesRemote({ baseUrl: process.env.VUE_APP_API_BASE_URL })
}

const MESSAGE_API_LIMIT = 50

export default {
  state: () => ({
    conversationId: null,
    focusDate: null,
    list: null,
    hasOlder: false, // are there more older messages available to fetch
    hasNewer: false // are there more newer messages available to fetch
  }),
  mutations: {
    clearMessages (state) {
      state.conversationId = null
      state.focusDate = null
      state.list = null
      state.hasOlder = false
      state.hasNewer = false
    },
    updateMessages (state, { conversationId, focusDate, messages, hasOlder, hasNewer }) {
      state.conversationId = conversationId
      state.focusDate = focusDate
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
    async loadMessages (context, { conversationId, ts }) {
      context.commit('clearMessages')
      try {
        const [olderMessages, newerMessages] = await Promise.all([
          models.remote.get(
            null,
            { inclusive: false, value: ts },
            conversationId,
            true,
            null,
            MESSAGE_API_LIMIT
          ),
          models.remote.get(
            { inclusive: true, value: ts },
            null,
            conversationId,
            true,
            null,
            MESSAGE_API_LIMIT
          )
        ])

        context.commit('updateMessages', {
          conversationId,
          focusDate: ts,
          messages: olderMessages.concat(newerMessages),
          hasOlder: olderMessages.length >= MESSAGE_API_LIMIT,
          hasNewer: newerMessages.length >= MESSAGE_API_LIMIT
        })
      } catch (e) {
        console.error(e)
        // TODO handle error
      }
    },
    async loadOlderMessages (context) {
      try {
        const ts = context.state.list[0].ts
        const conversationId = context.state.conversationId

        const messages = await models.remote.get(
          null,
          { inclusive: false, value: ts },
          conversationId,
          true,
          null,
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
    async loadNewerMessages (context) {
      try {
        const list = context.state.list
        const ts = list[list.length - 1].ts
        const conversationId = context.state.conversationId

        const messages = await models.remote.get(
          { inclusive: false, value: ts },
          null,
          conversationId,
          true,
          null,
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
