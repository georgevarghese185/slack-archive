<template>
  <div class="backup-container">
    <div class="running-backup">
      <p class="title">Backup Running</p>
      <div class="status">
        <div class="info"><b>Status</b>: Collecting info...</div>
        <Spinner class="spinner"/>
      </div>
      <div class="info"><b>Error</b>: Something went wrong</div>
      <div class="info"><b>Messages</b>: 3920</div>
      <div class="info"><b>Conversations</b>: 2</div>
      <Button class="button" label="Cancel" @click="startBackup"/>
    </div>
    <div v-if="this.stats" class="backup-stats">
      <p class="title">Stats</p>
      <div class="info"><b>Backed Up</b>: {{ this.stats.messages }} messages across {{ this.stats.conversations }} conversations</div>
      <div class="info"><b>Last successful backup</b>: {{ this.lastBackup }}</div>
      <Button class="button" label="Backup Now" @click="startBackup"/>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import Button from '../components/Button'
import Spinner from '../components/Spinner'

export default {
  mounted () {
    this.$store.dispatch('loadBackupStats')
  },
  methods: {
    startBackup () {}
  },
  computed: {
    stats () {
      return this.$store.state.backups.stats
    },
    lastBackup () {
      return this.stats.lastBackupAt
        ? dayjs(this.stats.lastBackupAt).format('MMM D, YYYY')
        : 'never'
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
