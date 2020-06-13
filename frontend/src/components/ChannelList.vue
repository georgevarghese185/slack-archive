<template>
  <div class="channel-list-container">
    <div class="conversation-list" v-if="conversations">
      <div :class="getConversationClass(conversation)" v-for="conversation of conversations" :key="conversation.id"
      @click="() => selectConversation(conversation)">
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
import { toSlackTs } from '../util/slackTime'

export default {
  data () {
    return {
      selected: null
    }
  },
  computed: {
    conversations () {
      return this.$store.state.archive.conversations.list
    }
  },
  async mounted () {
    await this.$store.dispatch('loadConversations')

    const id = this.$route.params.conversationId
    const conversation = id ? this.getConversation(id) : this.conversations[0]
    this.selectConversation(conversation)
  },
  methods: {
    selectConversation (conversation) {
      this.selected = conversation

      this.changeRoute(conversation)

      this.$store.dispatch('loadMessages', {
        conversationId: conversation.id,
        ts: toSlackTs(Date.now())
      })
    },
    changeRoute (conversation) {
      const { conversationId } = this.$route.params
      if (conversation.id !== conversationId) {
        this.$router.push({ name: 'Archive', params: { conversationId: conversation.id } })
      }
    },
    getConversationClass (conversation) {
      return {
        conversation: true,
        'conversation-selected': this.selected === conversation
      }
    },
    getConversation (id) {
      return this.conversations.find(c => c.id === id)
    }
  },
  components: {
    Spinner
  }
}
</script>

<style scoped>
  .channel-list-container {
    width: 250px;
    height: 100%;
  }

  .conversation-list {
    margin-top: 48px;
  }

  .conversation {
    padding: 5px 0 5px 18px;
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
    font-family: sans-serif;
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
