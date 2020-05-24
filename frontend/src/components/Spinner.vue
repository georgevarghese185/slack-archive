<template>
  <img class="progress" src="../assets/progress.png">
</template>

<style scoped>
  .progress {
    animation: spin 2s linear infinite;
    width: 16px;
  }

  @keyframes spin {
    from { transform: rotate(0deg) }
    from { transform: rotate(-360deg) }
  }
</style>
