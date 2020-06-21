import { baseStore, models, MESSAGE_API_LIMIT } from './base'

export default {
  state: () => ({
    conversationId: null,
    focusDate: null,
    ...baseStore.state()
  }),
  mutations: {
    ...baseStore.mutations,
    clearMessages (state) {
      state.conversationId = null
      state.focusDate = null
      baseStore.mutations.clearMessages(state)
    },
    updateMessages (state, { conversationId, focusDate, ...params }) {
      state.conversationId = conversationId
      state.focusDate = focusDate
      baseStore.mutations.updateMessages(state, params)
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
      const conversationId = context.state.conversationId

      baseStore.actions.loadOlderMessages(context, {
        conversationId,
        postsOnly: true,
        threadTs: null
      })
    },
    async loadNewerMessages (context) {
      const conversationId = context.state.conversationId

      baseStore.actions.loadNewerMessages(context, {
        conversationId,
        postsOnly: true,
        threadTs: null
      })
    }
  }
}
