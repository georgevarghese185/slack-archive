<template>
  <div class="message-viewer-container">
    <MessageList class="message-list" :messages="messages" :hasNewer="hasNewer" :hasOlder="hasOlder"
    :focusDate="focusDate" @loadOlderMessages="loadOlderMessages" @loadNewerMessages="loadNewerMessages"/>
    <transition name="fade">
      <div v-if="thread" class="thread-pane-background" @click="closeThread"/>
    </transition>
    <transition name="slide-left">
      <Thread v-if="thread" class="thread-pane" />
    </transition>
  </div>
</template>

<script>
import MessageList from './MessageViewerList'
import Thread from './MessageViewerThread'
import { toSlackTs } from '../util/slackTime'

export default {
  data () {
    return {
      focusDate: null
    }
  },
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
    thread () {
      return this.$route.query.thread
    },
    store () {
      return this.$store.state.archive.messages
    },
    messages () {
      return this.store.posts.list
    },
    hasOlder () {
      return this.store.posts.hasOlder
    },
    hasNewer () {
      return this.store.posts.hasNewer
    }
  },
  methods: {
    loadMessages () {
      this.focusDate = this.$route.params.ts || toSlackTs(Date.now())

      this.$store.dispatch('posts/loadMessages', {
        conversationId: this.conversationId,
        ts: this.focusDate
      })
    },
    loadOlderMessages () {
      this.$store.dispatch('posts/loadOlderMessages')
    },
    loadNewerMessages () {
      this.$store.dispatch('posts/loadNewerMessages')
    },
    closeThread () {
      this.$router.push({ query: { thread: undefined } })
    }
  },
  components: {
    MessageList,
    Thread
  }
}

</script>

<style scoped>
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

  .thread-pane {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    width: 712px;
    height: 100%;
    box-shadow: -2px 0px 6px 2px #0000001a;
  }

  .thread-pane-background {
    z-index: 1;
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: #8181816e;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  .slide-left-enter-active, .slide-left-leave-active {
    transition: transform 0.3s ease-out;
  }

  .slide-left-enter, .slide-left-leave-to {
    transform: translateX(712px);
  }
</style>
