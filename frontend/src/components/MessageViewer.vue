<template>
  <div class="message-viewer-container">
    <div class="message-list">
      <div v-if="messages.length == 0" class="no-messages"> No messages </div>
      <div v-for="(message, i) in messages" :key="message.ts">
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
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import slackTime from '../util/slackTime'

const { getMillis, getTime, getDayMillis, getDate } = slackTime

const axiosInstance = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })

export default {
  props: ['day'],
  data () {
    return {
      items: [],
      messages: []
    }
  },
  async mounted () {
    const response = await axiosInstance.get('/v1/messages?chronological=true')
    this.messages = response.data.messages

    const messages = response.data.messages

    // TODO use real images
    messages.forEach(m => {
      m.userImage = 'https://secure.gravatar.com/avatar/24bc11de4159fb0d76733f76fd936a37.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0010-24.png'
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
