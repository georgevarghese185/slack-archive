<template>
  <div class="message" :title="getDateString(message)">
    <div class="user-image-container">
      <img v-if="shouldShowUserImage" class="user-image" :src="profileImage"/>
    </div>
    <div class="message-contents">
      <div v-if="shouldShowHeader">
        <span class="user-name"> {{message.user}} </span>
        <span class="message-time"> {{getTime(message)}} </span>
      </div>
      <p class="message-body">
        {{message.text}}
      </p>
    </div>
  </div>
</template>

<script>
import slackTime from '../util/slackTime'

const { getTime, getDateString } = slackTime

export default {
  props: ['message', 'shouldShowUserImage', 'shouldShowHeader'],
  mounted () {
    if (!this.profileImage) {
      this.$store.dispatch('loadMember', this.message.user)
    }
  },
  computed: {
    profileImage () {
      return this.$store.getters.profilePicture(this.message.user)
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
</style>
