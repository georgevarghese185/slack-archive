<template>
  <div class="message-list-container" ref="messages">
    <Loader v-if="messageList == null"> Loading messages </Loader>
    <div v-if="messageList != null">
      <div v-if="messageList.length == 0" class="no-messages"> No messages </div>
      <Loader v-if="hasOlder" :scrollListener="scrollListener" @inView="loadOlder">
        Looking for earlier messageList
      </Loader>
      <div class="message-item" v-for="(message, i) in messageList" :key="message.ts">
        <div v-if="shouldShowDate(i)" class="day-separator"> {{getDate(message)}} </div>
        <Message :message="message" :showUserImage="!isContinuedMessage(i)" :showHeader="!isContinuedMessage(i)" />
      </div>
      <Loader v-if="hasNewer" :scrollListener="scrollListener" @inView="loadNewer">
        Looking for newer messages
      </Loader>
    </div>
  </div>
</template>

<script>
import Loader from './MessageViewerLoader'
import Message from './MessageViewerMessage'
import ScrollListener from '../util/ScrollListener'
import { getMillis, getDayMillis, getDate } from '../util/slackTime'

const getMessageDiff = (oldMessages, newMessages) => {
  oldMessages = oldMessages || []
  newMessages = newMessages || []
  const diff = {}

  const first = arr => arr[0]
  const last = arr => arr[arr.length - 1]
  const indexOfMessage = (messages, message) => {
    return (message == null) ? undefined : messages.findIndex(m => m.ts === message.ts)
  }

  const addedToTop = indexOfMessage(newMessages, first(oldMessages))
  if (addedToTop > 0) {
    diff.type = 'prepend'
    diff.addToTop = newMessages.slice(0, addedToTop)
    diff.removeFromBottom = oldMessages.length - 1 - indexOfMessage(oldMessages, last(newMessages))
    return diff
  }

  const indexInNew = indexOfMessage(newMessages, last(oldMessages))
  const addedToBottom = newMessages.length - 1 - indexInNew
  if (indexInNew > -1 && addedToBottom > 0) {
    diff.type = 'append'
    diff.addToBottom = newMessages.slice(-addedToBottom)
    diff.removeFromTop = indexOfMessage(oldMessages, first(newMessages))
    return diff
  }

  if (addedToTop === 0 && addedToBottom === 0) {
    diff.type = 'none'
    return diff
  }

  diff.type = 'new'
  return diff
}

export default {
  props: ['messages', 'hasNewer', 'hasOlder', 'focusDate'],
  data () {
    return {
      scrollListener: null,
      messageList: this.messages
    }
  },
  async mounted () {
    // This work needs to be done after the messages are rendered so do it on the next Vue tick
    this.$nextTick(() => {
      if (this.messages) {
        this.scrollToFocusDate()
      }

      this.scrollListener = new ScrollListener(this.$refs.messages)
    })
  },
  watch: {
    async messages (newMessages, oldMessages) {
      const diff = getMessageDiff(oldMessages, newMessages)

      if (diff.type === 'new') {
        this.messageList = newMessages
        await this.$nextTick()
        this.scrollToFocusDate()
      } else if (diff.type === 'prepend') {
        this.messageList = diff.addToTop.concat(this.messageList)
        const oldScrollState = this.getScrollState()

        await this.$nextTick()

        const newScrollState = this.getScrollState()
        const addedHeight = newScrollState.height - oldScrollState.height
        const newScrollTop = oldScrollState.top + addedHeight

        this.setScrollTop(newScrollTop)

        this.messageList = this.messageList.slice(0, this.messageList.length - diff.removeFromBottom)
      } else if (diff.type === 'append') {
        this.messageList = this.messageList.concat(diff.addToBottom)
        const oldScrollTop = this.getScrollState().top
        await this.$nextTick()
        this.setScrollTop(oldScrollTop)
        this.messageList = this.messageList.slice(diff.removeFromTop)
      }
    }
  },
  methods: {
    shouldShowDate (messageIndex) {
      if (messageIndex === 0) {
        return true
      }

      const message = this.messageList[messageIndex]
      const prevMessage = this.messageList[messageIndex - 1]

      return !this.isContinuedMessage(messageIndex) && getDayMillis(message.ts) !== getDayMillis(prevMessage.ts)
    },
    getDate (message) {
      return getDate(message.ts)
    },
    isContinuedMessage (messageIndex) {
      if (messageIndex === 0) {
        return false
      }

      const message = this.messageList[messageIndex]
      const prevMessage = this.messageList[messageIndex - 1]

      return prevMessage.user === message.user &&
        getDayMillis(message.ts) === getDayMillis(prevMessage.ts) &&
        getMillis(message.ts) - getMillis(prevMessage.ts) <= 15 * 60 * 1000
    },
    scrollToFocusDate () { // scroll to the first message from day in focus
      if (!this.messageList) {
        return
      }

      let index = this.messageList.findIndex(m => m.ts >= this.focusDate)
      if (index < 0) {
        index = this.messageList.length - 1
      }

      const messageList = this.$refs.messages

      if (!messageList) {
        return
      }

      // scroll to the first message from the requested day
      const e = messageList.querySelectorAll('.message-item')[index]
      e.scrollIntoView()
    },
    loadOlder () {
      this.$emit('loadOlderMessages')
    },
    loadNewer () {
      this.$emit('loadNewerMessages')
    },
    getScrollState () {
      const messageList = this.$refs.messages
      return messageList ? {
        top: messageList.scrollTop,
        height: messageList.scrollHeight
      } : null
    },
    setScrollTop (scrollTop) {
      const messageList = this.$refs.messages
      if (messageList) {
        messageList.scrollTop = scrollTop
      }
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
