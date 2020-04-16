<template>
  <div class="message-viewer-container">
    <div class="message-list">
      <div v-for="item in items" :key="item.ts">
        <div v-if="item.type === 'no-messages'" class="no-messages"> No messages </div>
        <div v-if="item.type === 'day-separator'" class="day-separator"> {{item.text}} </div>
        <div v-if="item.type === 'message'" class="message">
          <div class="user-image-container">
            <img v-if="!item.continued" class="user-image" :src="item.userImage"/>
          </div>
          <div class="message-contents">
            <div v-if="!item.continued" class="message-header">
              <span class="user-name"> {{item.user}} </span>
              <span class="message-time"> {{getTime(item.ts)}} </span>
            </div>
            <p :class="{ 'message-body': true, 'message-continued': item.continued }">
              {{item.text}}
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
      items: []
    }
  },
  async mounted () {
    const response = await axiosInstance.get('/v1/messages?chronological=true')
    const messages = response.data.messages

    if (messages.length === 0) {
      this.items.push({
        type: 'no-messages',
        ts: 'no-messages'
      })
      return
    }

    this.items.push({
      type: 'day-separator',
      text: getDate(messages[0].ts),
      ts: 'day-' + getDayMillis(messages[0].ts) // just need this for `key` in v-for
    })

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      const prevMessage = messages[i - 1]

      message.itemType = 'message'

      if (prevMessage && getDayMillis(message.ts) !== getDayMillis(prevMessage.ts)) {
        this.items.push({
          type: 'day-separator',
          text: getDate(message.ts),
          ts: 'day-' + getDayMillis(message.ts) // just need this for `key` in v-for
        })
      }

      // TODO use real images
      message.userImage = 'https://secure.gravatar.com/avatar/24bc11de4159fb0d76733f76fd936a37.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0010-24.png'

      if (prevMessage && prevMessage.user === message.user &&
          getMillis(message.ts) - getMillis(prevMessage.ts) <= 15 * 60 * 1000 &&
          getDayMillis(message.ts) === getDayMillis(prevMessage.ts)) {
        message.continued = true
      }

      this.items.push(message)
    }
  },
  methods: {
    getTime: getTime
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
