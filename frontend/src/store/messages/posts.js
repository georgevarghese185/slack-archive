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
      baseStore.actions.loadOlderMessages(context, {
        postsOnly: true,
        threadTs: null
      })
    },
    async loadNewerMessages (context) {
      baseStore.actions.loadNewerMessages(context, {
        postsOnly: true,
        threadTs: null
      })
    }
  }
}
