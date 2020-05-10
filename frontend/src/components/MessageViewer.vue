<template>
  <div class="message-viewer-container">
    <div class="message-list" ref="messages">
      <Loader v-if="messages == null"> Loading messages </Loader>
      <div v-if="messages != null">
        <div v-if="messages.length == 0" class="no-messages"> No messages </div>
        <Loader v-if="hasOlder" ref="olderMessagesLoader">
          Looking for earlier messages
        </Loader>
        <div class="message-item" v-for="(message, i) in messages" :key="message.ts">
          <div v-if="shouldShowDate(i)" class="day-separator"> {{getDate(message)}} </div>
          <Message :message="message" :shouldShowUserImage="!isContinuedMessage(i)" :shouldShowHeader="!isContinuedMessage(i)" />
        </div>
        <Loader v-if="hasNewer" ref="newerMessagesLoader">
          Looking for newer messages
        </Loader>
      </div>
    </div>
  </div>
</template>

<script>
import slackTime from '../util/slackTime'
import Loader from './MessageViewerLoader'
import Message from './MessageViewerMessage'
import ScrollListener from '../util/ScrollListener'

const { getMillis, getDayMillis, getDate } = slackTime

// TODO Replace "moreNewerMessages with hasNewer and hasOlder"

export default {
  data () {
    const { list, hasOlder, hasNewer } = this.$store.state.archive.messages
    return {
      messages: list,
      hasOlder,
      hasNewer
    }
  },
  async mounted () {
    // Listen for message list updates
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'updateMessages') {
        const { list, hasOlder, hasNewer } = state.archive.messages
        this.messages = list
        this.hasOlder = hasOlder
        this.hasNewer = hasNewer

        this.$nextTick(() => {
          this.scrollToFocusDate()
          if (!this.scrollListener) this.setupScrollListener()
        })
      }
    })

    // This work needs to be done after the messages are rendered so do it on the next Vue tick
    this.$nextTick(() => {
      if (this.messages) {
        this.scrollToFocusDate()
        this.setupScrollListener()
      }
    })
  },
  methods: {
    shouldShowDate (messageIndex) {
      if (messageIndex === 0) {
        return true
      }

      const message = this.messages[messageIndex]
      const prevMessage = this.messages[messageIndex - 1]

      return !this.isContinuedMessage(messageIndex) && getDayMillis(message.ts) !== getDayMillis(prevMessage.ts)
    },
    getDate (message) {
      return getDate(message.ts)
    },
    isContinuedMessage (messageIndex) {
      if (messageIndex === 0) {
        return false
      }

      const message = this.messages[messageIndex]
      const prevMessage = this.messages[messageIndex - 1]

      return prevMessage.user === message.user &&
        getDayMillis(message.ts) === getDayMillis(prevMessage.ts) &&
        getMillis(message.ts) - getMillis(prevMessage.ts) <= 15 * 60 * 1000
    },
    scrollToFocusDate () { // scroll to the first message from day in focus
      if (!this.messages) {
        return
      }

      const focusDate = this.$store.state.archive.messages.focusDate
      const index = this.messages.findIndex(m => m.ts >= focusDate)
      const messageList = this.$refs.messages

      // scroll to the first message from the requested day
      const e = messageList.querySelectorAll('.message-item')[index]
      e.scrollIntoView()
    },
    setupScrollListener () {
      // load more messages if user scrolls to the top/bottom
      this.scrollListener = new ScrollListener(this.$refs.messages)
      const olderMessagesLoader = (this.$refs.olderMessagesLoader || {}).$el
      const newerMessagesLoader = (this.$refs.newerMessagesLoader || {}).$el

      if (olderMessagesLoader) {
        this.scrollListener.whenInView(olderMessagesLoader, () => this.loadOlderMessages())
      }

      if (newerMessagesLoader) {
        this.scrollListener.whenInView(newerMessagesLoader, () => this.loadNewerMessages())
      }
    },
    async loadOlderMessages () {
      this.$store.dispatch('loadOlderMessages')
    },
    async loadNewerMessages () {
      this.$store.dispatch('loadNewerMessages')
    }
  },
  components: {
    Loader,
    Message
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
    overflow: auto;
  }

  .no-messages {
    text-align: center;
    color: #818181;
    margin-bottom: 18px;
  }

  .day-separator {
    font-size: 14px;
    color: #818181;
    padding: 8px 10px 8px 10px;
    text-align: center;
  }
</style>
