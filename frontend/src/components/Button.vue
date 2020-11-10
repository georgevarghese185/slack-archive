<template>
  <button class="button-container" @click="onClick">
    <p class="label">{{label}}</p>
  </button>
</template>

<script>
export default {
  props: ['label'],
  methods: {
    onClick () {
      this.$emitEvent('click')
    }
  }
}
</script>

<style scoped>
  .button-container {
    margin-top: 48px;
    background: #680763;
    padding: 8px 12px 8px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    box-shadow: 0px 1px 6px 2px #0000000d;
    transition: background-color 0.5s;
  }

  .button-container:hover {
    background: #861280;
  }

  .label {
    color: white;
    font-size: 20px;
  }
</style>
