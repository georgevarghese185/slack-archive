<template>
  <div class="archive-container">
    <div class="channel-list">
      <ChannelList />
    </div>
    <div class="right-section">
      <div class="date-picker">
        <DatePicker/>
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
    border-left: 1px solid #dcdcdc;
  }
</style>
