<template>
  <div class="message-viewer-container">
    <div class="message-list" ref="messages">
      <Loader v-if="messages == null"> Loading messages </Loader>
      <div v-if="messages != null">
        <div v-if="messages.length == 0" class="no-messages"> No messages </div>
        <Loader v-if="moreOlderMessages" ref="olderMessagesLoader">
          Looking for earlier messages
        </Loader>
        <div class="message-item" v-for="(message, i) in messages" :key="message.ts">
          <div v-if="shouldShowDate(i)" class="day-separator"> {{getDate(message)}} </div>
          <Message :message="message" :shouldShowUserImage="!isContinuedMessage(i)" :shouldShowHeader="!isContinuedMessage(i)" />
        </div>
        <Loader v-if="moreNewerMessages" ref="newerMessagesLoader">
          Looking for newer messages
        </Loader>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import slackTime from '../util/slackTime'
import Loader from './MessageViewerLoader'
import Message from './MessageViewerMessage'
import ScrollListener from '../util/ScrollListener'

const { getMillis, getDayMillis, getDate, toSlackTs } = slackTime

const axiosInstance = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })
const MESSAGE_API_LIMIT = 50
const MAX_MESSAGES = 300

const getMessages = async (params) => {
  // TODO authenticate
  // TODO add conversation ID param
  const response = await axiosInstance.get('/v1/messages', {
    params: { limit: MESSAGE_API_LIMIT, ...params }
  })

  return response.data.messages
}

export default {
  props: ['day'],
  data () {
    return {
      messages: null,
      moreOlderMessages: false, // are there more older messages available to fetch
      moreNewerMessages: false // are there more newer messages available to fetch
    }
  },
  async mounted () {
    const dayTs = toSlackTs(this.day)

    let messagesBefore
    let messagesAfter

    try {
      messagesBefore = await getMessages({ before: dayTs })
      messagesAfter = await getMessages({ from: dayTs })
    } catch (e) {
      // TODO handle error
      return
    }

    this.moreOlderMessages = messagesBefore.length >= MESSAGE_API_LIMIT
    this.moreNewerMessages = messagesAfter.length >= MESSAGE_API_LIMIT

    this.messages = messagesBefore.concat(messagesAfter)

    if (this.messages.length === 0) {
      return
    }

    // TODO use real images
    this.messages.forEach(m => {
      m.userImage = 'https://secure.gravatar.com/avatar/24bc11de4159fb0d76733f76fd936a37.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0010-24.png'
    })

    const focusIndex = Math.min(messagesBefore.length, this.messages.length - 1) // element to scroll into view

    // This work needs to be done after the messages are rendered so do it on the next Vue tick
    this.$nextTick(() => {
      // scroll to the first message from the requested day
      this.scrollToMessage(focusIndex)

      // load more messages if user scrolls to the top/bottom
      this.scrollListener = new ScrollListener(this.$refs.messages)
      const olderMessagesLoader = this.$refs.olderMessagesLoader.$el
      const newerMessagesLoader = this.$refs.newerMessagesLoader.$el

      if (olderMessagesLoader) {
        this.scrollListener.whenInView(olderMessagesLoader, () => this.loadOlderMessages())
      }

      if (newerMessagesLoader) {
        this.scrollListener.whenInView(newerMessagesLoader, () => this.loadNewerMessages())
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
    scrollToMessage (i) {
      const messageList = this.$refs.messages

      // scroll to the first message from the requested day
      const e = messageList.querySelectorAll('.message-item')[i]
      e.scrollIntoView()
    },
    async loadOlderMessages () {
      if (this.loadingOlderMessages) {
        // another load is already happening. Don't run 2 in parallel
        return
      }

      this.loadingOlderMessages = true
      let olderMessages

      try {
        olderMessages = await getMessages({ before: this.messages[0].ts })
      } catch (e) {
        // TODO handle errors
      }

      if (olderMessages.length < MESSAGE_API_LIMIT) {
        this.moreOlderMessages = false
      } else {
        this.moreOlderMessages = true
      }

      const messageList = this.$refs.messages
      const oldScrollHeight = messageList.scrollHeight
      const oldScrollTop = messageList.scrollTop

      this.messages = olderMessages.concat(this.messages)

      this.$nextTick(() => {
        // New scroll position after the message list changes could be off. This will fix it
        messageList.scrollTop = messageList.scrollHeight - oldScrollHeight + oldScrollTop

        if (this.messages.length > MAX_MESSAGES) {
          this.messages = this.messages.slice(0, MAX_MESSAGES)
          this.moreNewerMessages = true
        }
      })

      this.loadingOlderMessages = false
    },
    async loadNewerMessages () {
      if (this.loadingNewerMessages) {
        // another load is already happening. Don't run 2 in parallel
        return
      }

      this.loadingNewerMessages = true
      let newerMessages

      try {
        newerMessages = await getMessages({ after: this.messages[this.messages.length - 1].ts })
      } catch (e) {
        // TODO handle errors
      }

      if (newerMessages.length < MESSAGE_API_LIMIT) {
        this.moreNewerMessages = false
      } else {
        this.moreNewerMessages = true
      }

      this.messages = this.messages.concat(newerMessages)

      this.$nextTick(() => {
        if (this.messages.length > MAX_MESSAGES) {
          this.messages = this.messages.slice(-MAX_MESSAGES)
          this.moreOlderMessages = true
        }
      })

      this.loadingNewerMessages = false
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
