import ConversationsRemote from '../models/remote/Conversations'

const models = {
  remote: new ConversationsRemote()
}

export default {
  state: () => ({
    list: null
  }),
  mutations: {
    updateConversations (state, conversations) {
      state.list = conversations
    }
  },
  actions: {
    async loadConversations (context) {
      const conversations = await models.remote.listAll()
      context.commit('updateConversations', conversations)
    }
  }
}
