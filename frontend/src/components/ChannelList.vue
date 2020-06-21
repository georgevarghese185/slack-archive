<template>
  <div class="channel-list-container">
    <div class="conversation-list" v-if="conversations">
      <div :class="getConversationClass(conversation)" v-for="conversation of conversations" :key="conversation.id"
      @click="() => changeRoute(conversation.id)">
        <span class="conversation-symbol">#</span><span class="conversation-name"> {{conversation.name}} </span>
      </div>
    </div>
    <div class="loader" v-if="!conversations">
      <Spinner class="spinner"/>
    </div>
  </div>
</template>

<script>
import Spinner from '../components/Spinner'

export default {
  computed: {
    conversations () {
      return this.$store.state.archive.conversations.list
    },
    conversationId () {
      return this.$route.params.conversationId
    }
  },
  async mounted () {
    if (!this.conversations) {
      await this.$store.dispatch('loadConversations')
    }

    const id = this.conversationId || this.conversations[0].id
    this.changeRoute(id)
  },
  methods: {
    changeRoute (conversationId) {
      if (conversationId !== this.conversationId) {
        this.$router.push({ name: 'Archive', params: { conversationId } })
      }
    },
    getConversationClass (conversation) {
      return {
        conversation: true,
        'conversation-selected': this.conversationId === conversation.id
      }
    }
  },
  components: {
    Spinner
  }
}
</script>

<style scoped>
  .channel-list-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: auto;
  }

  .conversation-list {
    position:absolute;
    width: 100%;
    height: 100%;
    padding-top: 28px;
  }

  .conversation {
    padding: 5px 0 5px 28px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    transition: background-color 0.1s;
    user-select: none;
    cursor: pointer;
  }

  .conversation:hover {
    background-color: #80808052;
  }

  .conversation-selected {
    background-color: #808080a6;
  }

  .conversation-symbol {
    font-family: monospace;
    font-size: 18px;
    margin-left: 0px;
  }

  .conversation-name {
    font-size: 18px;
    margin-left: 10px;
  }

  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .spinner {
    width: 26px;
  }
</style>
