<template>
  <div class="backup-container">
    <div v-if="this.runningBackup" class="running-backup">
      <p class="title">Backup Running</p>
      <div class="status">
        <div class="info"><b>Status</b>: {{ this.backupStatus }}</div>
        <Spinner v-if="backupInProgress" class="spinner"/>
      </div>
      <div v-if="this.runningBackup.error" class="info"><b>Error</b>: {{ this.runningBackup.error }}</div>
      <div class="info"><b>Messages</b>: {{ this.runningBackup.messagesBackedUp }} </div>
      <div class="info"><b>Conversations</b>: {{ this.runningBackup.backedUpConversations.length }}</div>
      <Button class="button" label="Cancel" @click="cancelBackup"/>
    </div>
    <div v-if="this.stats" class="backup-stats">
      <p class="title">Stats</p>
      <div class="info"><b>Backed Up</b>: {{ this.stats.messages }} messages across {{ this.stats.conversations }} conversations</div>
      <div class="info"><b>Last successful backup</b>: {{ this.lastBackup }}</div>
      <Button v-if="!runningBackup" class="button" label="Backup Now" @click="startBackup"/>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import Button from '../components/Button'
import Spinner from '../components/Spinner'

const POLL_INTERVAL = 1000

export default {
  data: () => ({
    pollId: null
  }),
  async mounted () {
    this.$store.dispatch('loadBackupStats')
    await this.$store.dispatch('loadRunningBackup')

    if (this.runningBackup) {
      this.pollRunningBackup()
    }
  },
  beforeDestroy () {
    if (this.pollId) {
      clearTimeout(this.pollId)
    }
  },
  methods: {
    startBackup () {},
    cancelBackup () {},
    async pollRunningBackup () {
      if (this.backupInProgress) {
        this.pollId = setTimeout(async () => {
          await this.$store.dispatch('loadRunningBackup')
          this.pollRunningBackup()
        }, POLL_INTERVAL)
      } else {
        this.pollId = null
      }
    }
  },
  computed: {
    stats () {
      return this.$store.state.backups.stats
    },
    lastBackup () {
      return this.stats.lastBackupAt
        ? dayjs(this.stats.lastBackupAt).format('MMM D, YYYY')
        : 'never'
    },
    runningBackup () {
      return this.$store.state.backups.running
    },
    backupInProgress () {
      return ['COMPLETED', 'CANCELED', 'FAILED'].indexOf(this.runningBackup.status) === -1
    },
    backupStatus () {
      const status = this.runningBackup.status
      switch (status) {
        case 'BACKING_UP':
          return `Backing up ${this.currentConversation}...`
        case 'COLLECTING_INFO':
          return 'Collecting Info...'
        default:
          return status[0] + status.slice(1).toLowerCase()
      }
    },
    currentConversation () {
      const conversationId = this.runningBackup.currentConversation
      const conversations = this.$store.state.archive.conversations.list || []
      const conversation = conversations.find(c => c.id === conversationId)

      if (conversation) {
        return `#${conversation.name}`
      } else {
        this.$store.dispatch('loadConversations')
        return ''
      }
    }
  },
  components: {
    Button,
    Spinner
  }
}
</script>

<style scoped>
  .backup-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    padding: 6% 0 0 10%;
  }

  .status {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: baseline;
  }

  .running-backup {
    margin-bottom: 84px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .spinner {
    margin-left: 6px;
    width: 16px;
    opacity: 0.7;
  }

  .backup-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    font-size: 40px;
    font-weight: bold;
    margin-bottom: 24px;
  }

  .info {
    font-size: 20px;
    margin-bottom: 8px;
    color: #4c4c4c;
  }

  .button {
    margin-top: 24px;
  }
</style>
