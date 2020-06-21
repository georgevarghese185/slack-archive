<template>
  <div class="message-viewer-container">
    <MessageList class="message-list" :messages="messages" :hasNewer="hasNewer" :hasOlder="hasOlder"
    :focusDate="focusDate" @loadOlderMessages="loadOlderMessages" @loadNewerMessages="loadNewerMessages"/>
  </div>
</template>

<script>
import MessageList from './MessageViewerList'
import { toSlackTs } from '../util/slackTime'

export default {
  mounted () {
    this.$watch('conversationId', (conversationId, prevId) => {
      if (conversationId && conversationId !== prevId) {
        this.loadMessages()
      }
    }, { immediate: true })
  },
  computed: {
    conversationId () {
      return this.$route.params.conversationId
    },
    messages () {
      return this.$store.state.archive.messages.posts.list
    },
    hasOlder () {
      return this.$store.state.archive.messages.posts.hasOlder
    },
    hasNewer () {
      return this.$store.state.archive.messages.posts.hasNewer
    },
    focusDate () {
      return this.$store.state.archive.messages.posts.focusDate
    }
  },
  methods: {
    loadMessages () {
      this.$store.dispatch('loadMessages', {
        conversationId: this.conversationId,
        ts: this.$route.params.ts || toSlackTs(Date.now())
      })
    },
    async loadOlderMessages () {
      this.$store.dispatch('loadOlderMessages')
    },
    async loadNewerMessages () {
      this.$store.dispatch('loadNewerMessages')
    }
  },
  components: {
    MessageList
  }
}

</script>

<style scoped>
  * {
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
