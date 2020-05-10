import MessagesRemote from '../models/remote/Messages'

const MESSAGE_API_LIMIT = 50

const models = {
  messages: {
    remote: new MessagesRemote({ baseUrl: process.env.VUE_APP_API_BASE_URL })
  }
}

export default {
  state: () => ({
    messages: {
      list: null,
      hasOlder: false, // are there more older messages available to fetch
      hasNewer: false // are there more newer messages available to fetch
    }
  }),
  mutations: {
    updateMessages (state, { conversationId, focusDate, messages, hasOlder, hasNewer }) {
      state.messages = {
        conversationId,
        focusDate,
        list: messages,
        hasNewer,
        hasOlder
      }
    }
  },
  actions: {
    async loadMessages (context, { conversationId, ts }) {
      try {
        const [olderMessages, newerMessages] = await Promise.all([
          models.messages.remote.get(
            null,
            { inclusive: false, value: ts },
            conversationId,
            true,
            null,
            MESSAGE_API_LIMIT
          ),
          models.messages.remote.get(
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
    }
  }
}
