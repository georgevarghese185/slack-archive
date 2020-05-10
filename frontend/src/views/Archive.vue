<template>
  <div class="archive-container">
    <div class="channel-list">
      <ChannelList />
    </div>
    <div class="right-section">
      <div class="date-picker">
        <DatePicker :day="day"/>
      </div>
      <div class="message-viewer">
        <MessageViewer />
      </div>
    </div>
  </div>
</template>

<script>
import ChannelList from '../components/ChannelList'
import DatePicker from '../components/DatePicker'
import MessageViewer from '../components/MessageViewer'
import slackTime from '../util/slackTime'

const { toSlackTs } = slackTime

export default {
  data () {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return {
      day: toSlackTs(1580728712000) // TODO remove hardcoded date
    }
  },
  mounted () {
    this.$store.dispatch('loadMessages', { conversationId: 'C1', ts: this.day }) // TODO remove hardcoded conversation ID
  },
  components: {
    ChannelList,
    DatePicker,
    MessageViewer
  }
}
</script>

<style scoped>
  .archive-container {
    background: #efefef;
    display: flex;
    width: 100%;
    height: 100%;
  }

  .right-section {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .message-viewer {
    flex-grow: 1;
    margin: 14px;
    border: 2px solid #707070;
    border-radius: 5px;
  }
</style>
