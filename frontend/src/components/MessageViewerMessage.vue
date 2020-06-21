<template>
  <div class="message" :title="getDateString(message)">
    <div class="user-image-container">
      <img v-if="showUserImage" class="user-image" :src="profileImage"/>
    </div>
    <div class="message-contents">
      <div v-if="showHeader">
        <span class="user-name"> {{name}} </span>
        <span class="message-time"> {{getTime(message)}} </span>
      </div>
      <p class="message-body">
        {{message.text}}
      </p>
      <router-link v-if="replyCount" class="message-replies" :to="{ query: { thread: message.ts } }">
        {{replyCount}} repl{{replyCount > 1 ? 'ies': 'y'}}
      </router-link>
    </div>
  </div>
</template>

<script>
import { getTime, getDateString } from '../util/slackTime'

export default {
  props: ['message', 'showUserImage', 'showHeader'],
  mounted () {
    if (!this.profileImage) {
      this.$store.dispatch('loadMember', this.message.user)
    }
  },
  computed: {
    profileImage () {
      return this.$store.getters.profilePicture(this.message.user)
    },
    name () {
      return this.$store.getters.userName(this.message.user)
    },
    replyCount () {
      return this.message.reply_count
    }
  },
  methods: {
    getDateString (message) {
      return getDateString(message.ts)
    },
    getTime (message) {
      return getTime(message.ts)
    }
  }
}
</script>

<style scoped>
  .message {
    display: flex;
    padding: 8px 10px 8px 10px;
    transition: background 0.1s;
    margin: 6px 0 6px 0;
  }

  .message:hover {
    background: #aaaaaa52
  }

  .message-contents {
    margin-left: 14px;
  }

  .user-image-container {
    min-width: 38px;
  }

  .user-image {
    width: 38px;
    height: 38px;
    object-fit: cover;
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
  }

  .message-replies {
    display: block;
    margin: 12px 0 0 12px;
    font-size: 14px;
    text-decoration: none;
    color: #060f8a;
    font-weight: bold;
  }

  .message-replies:hover {
    text-decoration: underline;
  }
</style>
