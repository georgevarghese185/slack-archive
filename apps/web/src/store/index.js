import Vue from 'vue'
import Vuex from 'vuex'
import archive from './archive'
import backups from './backups'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    archive,
    backups
  },
  state: {
    invalidLogin: false
  },
  mutations: {
    setInvalidLogin (state, isInvalid) {
      state.invalidLogin = isInvalid
    }
  }
})

export default store
