<template>
  <div class="loader">
    <img class="progress" src="../assets/progress.png">
    <p class="loader-text"> <slot></slot> </p>
  </div>
</template>

<script>
export default {
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

  .progress {
    width: 16px;
    margin-right: 4px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg) }
    from { transform: rotate(-360deg) }
  }
</style>
