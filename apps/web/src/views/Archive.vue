<template>
  <div class="archive-container">
    <ChannelList class="channel-list"/>
    <div class="right-section">
      <DatePicker/>
      <MessageViewer class="message-viewer"/>
    </div>
  </div>
</template>

<script>
import ChannelList from '../components/ChannelList'
import DatePicker from '../components/DatePicker'
import MessageViewer from '../components/MessageViewer'

export default {
  components: {
    ChannelList,
    DatePicker,
    MessageViewer
  }
}
</script>

<style scoped>
  .archive-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    background: #efefef;
  }

  .channel-list {
    width: 280px;
  }

  .right-section {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
  }

  .message-viewer {
    flex-grow: 1;
    border-left: 1px solid #dcdcdc;
  }
</style>
