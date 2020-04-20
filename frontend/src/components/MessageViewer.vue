<template>
  <div class="message-viewer-container">
    <div class="message-list" ref="messages">
      <div v-if="messages == null" class="loader">
        <img class="progress" src="../assets/progress.png">
        <p class="loader-text"> Loading messages </p>
      </div>
      <div v-if="messages != null">
        <div v-if="messages.length == 0" class="no-messages"> No messages </div>
        <div v-if="moreOlderMessages" class="loader" ref="olderMessagesLoader">
          <img class="progress" src="../assets/progress.png">
          <p class="loader-text"> Looking for earlier messages </p>
        </div>
        <div class="message-item" v-for="(message, i) in messages" :key="message.ts">
          <div v-if="shouldShowDate(i)" class="day-separator"> {{getDate(message)}} </div>
          <div class="message">
            <div class="user-image-container">
              <img v-if="!isContinuedMessage(i)" class="user-image" :src="message.userImage"/>
            </div>
            <div class="message-contents">
              <div v-if="!isContinuedMessage(i)" class="message-header">
                <span class="user-name"> {{message.user}} </span>
                <span class="message-time"> {{getTime(message)}} </span>
              </div>
              <p :class="{ 'message-body': true, 'message-continued': isContinuedMessage(i) }">
                {{message.text}}
              </p>
            </div>
          </div>
        </div>
        <div v-if="moreNewerMessages" class="loader" ref="newerMessagesLoader">
          <img class="progress" src="../assets/progress.png">
          <p class="loader-text"> Looking for newer messages </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import slackTime from '../util/slackTime'
import ScrollListener from '../util/ScrollListener'

const { getMillis, getTime, getDayMillis, getDate, toSlackTs } = slackTime

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
      items: [],
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
      const olderMessagesLoader = this.$refs.olderMessagesLoader
      const newerMessagesLoader = this.$refs.newerMessagesLoader

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
    getTime (message) {
      return getTime(message.ts)
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
  }
}

</script>

<style scoped>
  * {
    font-family: sans-serif;
  }

  p {
    margin: 0;
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

  .loader {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 20px 0 20px 0;
    opacity: 0.7;
  }

  .loader-text {
    font-size: 14px;
    margin-left: 4px;
  }

  .progress {
    width: 16px;
    margin-right: 4px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg) }
    from { transform: rotate(-360deg) }
  }

  .message {
    display: flex;
    padding: 10px 14px 10px 10px;
    transition: background 0.1s;
  }

  .message:hover {
    background: #aaaaaa52
  }

  .message-contents {
    margin-left: 14px;
  }

  .user-image-container {
    width: 38px;
  }

  .user-image {
    width: 38px;
    height: 38px;
  }

  .user-name {
    font-size: 14px;
    font-weight: bold;
  }

  .message-time {
    font-size: 12px;
    color: #818181;
  }

  .message-body {
    font-size: 14px;
    margin-top: 12px;
  }

  .message-continued {
    margin-top: -8px;
  }

  .day-separator {
    font-size: 14px;
    color: #818181;
    padding: 8px 10px 8px 10px;
    text-align: center;
  }
</style>
