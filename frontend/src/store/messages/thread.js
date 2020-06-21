import { baseStore, models, MESSAGE_API_LIMIT } from './base'

export default {
  namespaced: true,
  state: () => ({
    threadTs: null,
    ...baseStore.state()
  }),
  mutations: {
    ...baseStore.mutations,
    updateMessages (state, { threadTs, ...params }) {
      state.threadTs = threadTs
      baseStore.mutations.updateMessages(state, params)
    }
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
          threadTs,
          messages: thread,
          hasOlder: false,
          hasNewer: thread.length >= MESSAGE_API_LIMIT
        })
      } catch (e) {
        // TODO handle error
        console.error(e)
      }
    },
    async loadOlderMessages (context) {
      return baseStore.actions.loadOlderMessages(context, {
        postsOnly: false,
        threadTs: context.state.threadTs
      })
    },
    async loadNewerMessages (context) {
      return baseStore.actions.loadNewerMessages(context, {
        postsOnly: false,
        threadTs: context.state.threadTs
      })
    }
  }
}
