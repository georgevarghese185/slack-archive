import { baseStore, models, MESSAGE_API_LIMIT } from './base'

export default {
  namespaced: true,
  state: () => ({
    ...baseStore.state()
  }),
  mutations: {
    ...baseStore.mutations
  },
  actions: {
    async loadMessages (context, { conversationId, threadTs }) {
      context.commit('clearMessages')

      try {
        const thread = await models.remote.get(
          { inclusive: true, value: threadTs },
          null,
          conversationId,
          false,
          threadTs,
          MESSAGE_API_LIMIT
        )

        context.commit('updateMessages', {
          conversationId,
          messages: thread,
          hasOlder: false,
          hasNewer: thread.length >= MESSAGE_API_LIMIT
        })
      } catch (e) {
        // TODO handle error
        console.error(e)
      }
    }
  }
}
