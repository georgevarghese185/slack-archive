import MembersRemote from '../models/remote/Members'
import Vue from 'vue'

const models = {
  remote: new MembersRemote()
}

const loading = {}

export default {
  state: () => ({
  }),
  getters: {
    profilePicture: (state) => (memberId) => {
      if (!state[memberId]) {
        return null
      }

      return state[memberId].profile.image_48
    }
  },
  mutations: {
    updateMember (state, member) {
      Vue.set(state, member.id, member)
    }
  },
  actions: {
    async loadMember (context, memberId) {
      if (loading[memberId]) {
        return // this member is already being fetched
      }

      loading[memberId] = true

      try {
        const member = await models.remote.get(memberId)
        context.commit('updateMember', member)
      } catch (e) {
        console.error(e)
        // TODO handle error
      }

      delete loading[memberId]
    }
  }
}
