<template>
  <div class="loader" ref="loader">
    <Spinner class="spinner"/>
    <p class="loader-text"> <slot></slot> </p>
  </div>
</template>

<script>
import Spinner from './Spinner'

export default {
  props: ['scrollListener'],
  mounted () {
    this.$watch('scrollListener', (scrollListener, oldScrollListner) => {
      if (scrollListener) {
        this.stopListening = scrollListener.whenInView(this.$refs.loader, this.inView)
      }
    }, { immediate: true })
  },
  beforeDestroy () {
    this.stopListener()
  },
  methods: {
    inView () {
      this.$emit('inView')
    },
    stopListener () {
      this.stopListening && this.stopListening()
    }
  },
  components: {
    Spinner
  }
}
</script>

<style scoped>
  .loader {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 20px 0 20px 0;
    opacity: 0.7;
  }

  .loader-text {
    font-size: 14px;
    margin-left: 4px;
  }

  .spinner {
    margin-right: 4px;
    width: 16px;
  }
</style>
