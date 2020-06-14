<template>
  <div class="message-viewer-container">
    <MessageViewerList class="message-list" :messages="messages" :hasNewer="hasNewer" :hasOlder="hasOlder"
    :focusDate="focusDate"/>
  </div>
</template>

<script>
import MessageViewerList from './MessageViewerList'

export default {
  computed: {
    messages () {
      return this.$store.state.archive.messages.list
    },
    hasOlder () {
      return this.$store.state.archive.messages.hasOlder
    },
    hasNewer () {
      return this.$store.state.archive.messages.hasNewer
    },
    focusDate () {
      return this.$store.state.archive.messages.focusDate
    }
  },
  methods: {
    async loadOlderMessages () {
      this.$store.dispatch('loadOlderMessages')
    },
    async loadNewerMessages () {
      this.$store.dispatch('loadNewerMessages')
    }
  },
  components: {
    MessageViewerList
  }
}

</script>

<style scoped>
  * {
    font-family: sans-serif;
  }

  .message-viewer-container {
    position: relative;
    background: white;
    width: 100%;
    height: 100%;
  }

  .message-list {
    position: absolute;
    max-height: 100%;
    width: 100%;
    bottom: 0;
  }
</style>
