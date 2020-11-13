import * as api from '../api'

export default {
  state: () => ({
    stats: null,
    running: null
  }),
  mutations: {
    updateStats (state, stats) {
      state.stats = stats
    },
    updateRunning (state, running) {
      state.running = running || null
    }
  },
  actions: {
    async loadBackupStats (context) {
      try {
        const stats = await api.getBackupStats()
        context.commit('updateStats', stats)
      } catch (e) {
        // handle error
        console.error(e)
      }
    },
    async loadRunningBackup (context) {
      let backup

      try {
        if (context.state.running) {
          backup = await api.getBackup(context.state.running.id)
        } else {
          const backups = await api.getRunningBackups()
          backup = backups[0]
        }

        context.commit('updateRunning', backup)
      } catch (e) {
        // handle error
        console.error(e)
      }
    },
    async startBackup (context) {
      try {
        const id = await api.startBackup()
        const backup = await api.getBackup(id)
        context.commit('updateRunning', backup)
      } catch (e) {
        // handle error
        console.error(e)
      }
    },
    async cancelBackup (context) {
      try {
        await api.cancelBackup(context.state.running.id)
      } catch (e) {
        // handle error
        console.error(e)
      }
    }
  }
}
