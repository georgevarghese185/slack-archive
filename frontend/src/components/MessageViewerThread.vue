<template>
  <div class="thread-container" @click.stop="() => {}">
    <MessageLoader v-if="!replies"> Loading thread... </MessageLoader>
    <Message v-if="parent" :message="parent" showUserImage="true" showHeader="true"/>
    <div class="separator"/>
    <MessageList class="replies" v-if="replies" :messages="replies" :hasOlder="hasOlder" :hasNewer="hasNewer"
    :focusDate="focusDate" :focusMessage="focusMessage" @loadOlderMessages="loadOlder"
    @loadNewerMessages="loadNewer" />
  </div>
</template>

<script>
import MessageList from './MessageViewerList'
import Message from './MessageViewerMessage'
import MessageLoader from './MessageViewerLoader'

export default {
  mounted () {
    this.$watch('threadTs', (thread) => {
      if (thread) {
        this.loadThread()
      }
    }, { immediate: true })
  },
  computed: {
    conversationId () {
      return this.$route.params.conversationId
    },
    threadTs () {
      return this.$route.query.thread
    },
    store () {
      return this.$store.state.archive.messages.thread
    },
    parent () {
      if (!this.store.list) {
        return null
      }

      return this.store.list ? { ...this.store.list[0], reply_count: undefined } : null
    },
    replies () {
      return this.store.list
        ? this.store.list.slice(1).map(message => ({
          ...message,
          subtype: undefined,
          root: undefined
        }))
        : null
    },
    focusDate () {
      return this.parent.ts
    },
    focusMessage () {
      return this.$route.query.reply
    },
    hasOlder () {
      return this.store.hasOlder
    },
    hasNewer () {
      return this.store.hasNewer
    }
  },
  methods: {
    loadThread () {
      if (!this.threadTs || !this.conversationId) {
        return
      }

      this.$store.dispatch('thread/loadMessages', {
        conversationId: this.conversationId,
        threadTs: this.threadTs,
        ts: this.focusMessage
      })
    },
    loadOlder () {
      this.$store.dispatch('thread/loadOlderMessages')
    },
    loadNewer () {
      this.$store.dispatch('thread/loadNewerMessages')
    }
  },
  components: {
    Message,
    MessageList,
    MessageLoader
  }
}
</script>

<style scoped>
  .thread-container {
    background-color: white;
    display: flex;
    flex-direction: column;
  }

  .separator {
    border-bottom: 1px #d6d6d6 solid;
    margin: 22px 12px 0 12px;
  }

  .replies {

  }
</style>
