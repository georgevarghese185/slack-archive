import Vue from 'vue'
import Vuex from 'vuex'
import archive from './archive'
import backups from './backups'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    archive,
    backups
  }
})

export default store
