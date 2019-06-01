<template>
  <div class="main-container">
    <div class="toolbar">
      <div class="toolbar-title-container">
        <p class="toolbar-title" @click="goHome">Slack Archive</p>
      </div>
      <div class="toolbar-sign-in">
        <p class="toolbar-sign-in-text" v-if="!signedIn" @click="signIn"> SIGN IN </p>
        <p class="toolbar-sign-in-text" v-if="signedIn" @click="signOut"> SIGN OUT </p>
      </div>
    </div>
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  import {setSignedOut} from '../utils/session'
  import * as API from '../utils/api'

  export default{
    computed: {
      signedIn() {
        return this.$store.state.signedIn
      }
    },

    methods: {
      signIn() {
        this.$router.push('/sign-in')
      },
      signOut() {
        const _this = this;
        API.signOut()
          .then(() => {
            setSignedOut(_this.$store);
            _this.$router.push('/sign-out');
          }).catch(console.error);
      },
      goHome() {
        this.$router.push('/');
      }
    }
  }
</script>

<style scoped>
  p {
    font-family: sans-serif;
    user-select: none;
  }

  .main-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .toolbar {
    position: relative;
    height: 38px;
    background-color: rgb(63, 14, 64);
  }

  .toolbar-title-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .toolbar-title {
    font-size: 18px;
    font-weight: bold;
    color: white;
  }

  .toolbar-title:hover {
    cursor: pointer;
  }

  .toolbar-sign-in {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    right: 12px;
  }

  .toolbar-sign-in-text {
    margin: 0;
    font-size: 10px;
    font-weight: bold;
    color: rgb(200, 200, 200);
  }

  .toolbar-sign-in-text:hover {
    color: white;
    cursor: pointer;
  }

  .main-content {
    flex-grow: 1;
    position: relative;
  }
</style>
