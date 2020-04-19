<template>
  <div class="message-viewer-container">
    <div class="message-list" ref="messages">
      <div v-if="messages.length == 0" class="no-messages"> No messages </div>
      <div v-if="hasOlderMessages" class="loading-messages" ref="earlierMessagesLoader">
        <img class="progress" src="../assets/progress.png">
        <p class="loading-messages-text"> Looking for earlier messages </p>
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
      <div v-if="hasNewerMessages" class="loading-messages" ref="newerMessagesLoader">
        <img class="progress" src="../assets/progress.png">
        <p class="loading-messages-text"> Looking for newer messages </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import slackTime from '../util/slackTime'

const { getMillis, getTime, getDayMillis, getDate, toSlackTs } = slackTime

const axiosInstance = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })

export default {
  props: ['day'],
  data () {
    return {
      items: [],
      messages: [],
      hasOlderMessages: false,
      hasNewerMessages: false
    }
  },
  async mounted () {
    const dayTs = toSlackTs(this.day)

    let messagesBefore
    let messagesAfter

    try {
      // TODO authenticate
      let response = await axiosInstance.get('/v1/messages', {
        params: {
          chronological: true,
          from: dayTs,
          limit: 50
        }
      })

      messagesAfter = response.data.messages
      this.hasNewerMessages = messagesAfter.length >= 50

      // TODO authenticate
      response = await axiosInstance.get('/v1/messages', {
        params: {
          chronological: true,
          before: dayTs,
          limit: 50
        }
      })

      messagesBefore = response.data.messages
      this.hasOlderMessages = messagesBefore.length >= 50
    } catch (e) {
      // TODO handle error
      return
    }

    this.messages = messagesBefore.concat(messagesAfter)

    if (this.messages.length === 0) {
      return
    }

    // TODO use real images
    this.messages.forEach(m => {
      m.userImage = 'https://secure.gravatar.com/avatar/24bc11de4159fb0d76733f76fd936a37.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0010-24.png'
    })

    const focusIndex = Math.min(messagesBefore.length, this.messages.length - 1) // element to scroll into view

    this.$nextTick(() => {
      const e = this.$refs.messages.querySelectorAll('.message-item')[focusIndex]
      e.scrollIntoView()
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

  .loading-messages {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 20px 0 20px 0;
    opacity: 0.7;
  }

  .loading-messages-text {
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
