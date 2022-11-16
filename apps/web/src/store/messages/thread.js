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
    loadMessages: baseStore.actions.loadMessages,
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
