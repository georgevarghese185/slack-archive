<template>
  <div id="app">
    <Header/>
    <div class="main-container">
      <router-view/>
    </div>
  </div>
</template>

<script>
import Header from './components/Header'

export default {
  components: {
    Header
  }
}
</script>

<style>
  #app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  body {
    position: fixed;
    top: 0;
    bottom: 0;
    margin: 0;
    width: 100%;
    height: 100%;
  }

  p {
    margin: 0;
  }

  .main-container {
    width: 100%;
    height: 100%;
    background-color: #e8e8e8
  }
</style>
