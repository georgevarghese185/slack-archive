<template>
  <div :class="classes" :title="getDateString(message)">
    <div class="user-image-container">
      <img v-if="showUserImage" class="user-image" :src="profileImage"/>
    </div>
    <div class="message-contents">
      <div v-if="showHeader">
        <span class="user-name"> {{name}} </span>
        <span class="message-time"> {{getTime(message)}} </span>
      </div>
      <p v-if="isBroadcast" class="thread-header">From thread: {{parentMessage}}</p>
      <p class="message-body">
        {{message.text}}
      </p>
      <router-link v-if="replyCount" class="message-replies" :to="repliesLink">
        {{replyCount}} repl{{replyCount > 1 ? 'ies': 'y'}}
      </router-link>
    </div>
  </div>
</template>

<script>
import { getTime, getDateString } from '../util/slackTime'

export default {
  props: ['message', 'showUserImage', 'showHeader'],
  data () {
    return {
      isFocused: false
    }
  },
  mounted () {
    if (!this.profileImage) {
      this.$store.dispatch('loadMember', this.message.user)
    }

    if (this.$route.query.reply === this.message.ts) {
      this.isFocused = true
      setTimeout(() => {
        this.isFocused = false
      }, 3000)
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
      return (this.message.root || this.message).reply_count
    },
    isBroadcast () {
      return this.message.subtype === 'thread_broadcast'
    },
    parentMessage () {
      return this.message.root.text
    },
    repliesLink () {
      return {
        query: {
          thread: this.isBroadcast ? this.message.root.ts : this.message.ts,
          reply: this.isBroadcast ? this.message.ts : undefined
        }
      }
    },
    classes () {
      return {
        message: true,
        'message-highlight': this.isFocused
      }
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

  .message:hover, .message-highlight {
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
    display: inline;
    margin: 12px 0 0 12px;
    font-size: 14px;
    text-decoration: none;
    color: #060f8a;
    font-weight: bold;
  }

  .message-replies:hover {
    text-decoration: underline;
  }

  .thread-header {
    color: #7d7d7d;
    font-size: 14px;
    margin-bottom: 6px;
    text-overflow: ellipsis;
    width: 70%;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
