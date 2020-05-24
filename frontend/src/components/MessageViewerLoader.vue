<template>
  <div class="loader">
    <Spinner class="spinner"/>
    <p class="loader-text"> <slot></slot> </p>
  </div>
</template>

<script>
import Spinner from './Spinner'

export default {
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
