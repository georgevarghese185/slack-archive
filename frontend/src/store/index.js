import Vue from 'vue'
import Vuex from 'vuex'
import archive from './archive'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    archive
  }
})

export default store
