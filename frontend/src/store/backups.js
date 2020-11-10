import * as api from '../api'

export default {
  state: () => ({
    stats: null,
    running: []
  }),
  mutations: {
    updateStats (state, stats) {
      state.stats = stats
    }
  },
  actions: {
    async loadBackupStats (context) {
      context.commit('updateStats', null)

      try {
        const stats = await api.getBackupStats()
        context.commit('updateStats', stats)
      } catch (e) {
        // handle error
        console.error(e)
      }
  }
}
