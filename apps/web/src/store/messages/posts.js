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
    loadMessages: baseStore.actions.loadMessages,
    async loadOlderMessages (context) {
      return baseStore.actions.loadOlderMessages(context, {
        postsOnly: true,
        threadTs: null
      })
    },
    async loadNewerMessages (context) {
      return baseStore.actions.loadNewerMessages(context, {
        postsOnly: true,
        threadTs: null
      })
    }
  }
}
