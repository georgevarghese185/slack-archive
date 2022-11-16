<template>
  <button :class="classes" @click="onClick">
    <p class="label">{{label}}</p>
  </button>
</template>

<script>
export default {
  props: {
    label: String,
    enabled: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    classes () {
      return {
        'button-container': true,
        'button-container-enabled': this.enabled,
        'button-container-disabled': !this.enabled
      }
    }
  },
  methods: {
    onClick () {
      if (!this.enabled) {
        return
      }
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
  .button-container {
    background: #680763;
    padding: 8px 12px 8px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    box-shadow: 0px 1px 6px 2px #0000000d;
    transition: background-color 0.5s;
  }

  .button-container-disabled {
    background-color: #bfbfbf
  }

  .button-container-enabled:hover {
    background: #861280;
  }

  .label {
    color: white;
    font-size: 20px;
  }
</style>
