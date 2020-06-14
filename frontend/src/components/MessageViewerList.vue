<template>
  <div class="message-list-container" ref="messages">
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
</template>

<script>
import Loader from './MessageViewerLoader'
import Message from './MessageViewerMessage'
import { getMillis, getDayMillis, getDate } from '../util/slackTime'

const getChangeType = (oldMessages, newMessages) => {
  if (oldMessages !== newMessages) {
    return 'new'
  }

  if (newMessages.indexOf(oldMessages[0]) > 0) {
    return 'prepend'
  }

  const lastIndex = a => a.length - 1

  if (newMessages.indexOf(lastIndex(oldMessages)) < lastIndex(newMessages)) {
    return 'append'
  }

  return 'other'
}

export default {
  props: ['messages', 'hasNewer', 'hasOlder', 'focusDate'],
  async mounted () {
    // This work needs to be done after the messages are rendered so do it on the next Vue tick
    this.$nextTick(() => {
      if (this.messages) {
        this.scrollToFocusDate()
      }
    })
  },
  watch: {
    messages (oldMessages, newMessages) {
      const changeType = getChangeType(oldMessages, newMessages)

      if (changeType === 'new') {
        this.$nextTick(() => {
          this.scrollToFocusDate()
        })
      } else if (changeType === 'prepend') {
        const messageList = this.$refs.messages
        const oldScrollHeight = messageList.scrollHeight
        const oldScrollTop = messageList.scrollTop

        this.$nextTick(() => {
          // New scroll position after the message list changes could be off. This will fix it
          messageList.scrollTop = messageList.scrollHeight - oldScrollHeight + oldScrollTop
        })
      }
    }
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

      let index = this.messages.findIndex(m => m.ts >= this.focusDate)
      if (index < 0) {
        index = this.messages.length - 1
      }
      const messageList = this.$refs.messages

      // scroll to the first message from the requested day
      const e = messageList.querySelectorAll('.message-item')[index]
      e.scrollIntoView()
    }
  },
  components: {
    Loader,
    Message
  }
}
</script>

<style scoped>
  .message-list-container {
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
