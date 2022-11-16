<template>
  <div id="app">
    <div v-if="invalidLogin" class="login-dialog">
      <Card class="dialog-card">
        <h2 class="session-expired"> Session expired </h2>
        <Button label="Login" class="login-button" @click="login"/>
      </Card>
    </div>
    <Header/>
    <div class="main-container">
      <router-view/>
    </div>
  </div>
</template>

<script>
import Header from './components/Header'
import Card from './components/Card'
import Button from './components/Button'
import * as api from './api'
import { isLoggedIn, startLogin, logout } from './util/session'

export default {
  mounted () {
    if (isLoggedIn()) {
      api.checkLogin().catch(() => {
        this.$store.commit('setInvalidLogin', true)
      })
    }
  },
  computed: {
    invalidLogin () {
      return this.$store.state.invalidLogin
    }
  },
  methods: {
    async login () {
      await logout()
      startLogin()
    }
  },
  components: {
    Header,
    Card,
    Button
  }
}
</script>

<style>
  body {
    position: fixed;
    top: 0;
    bottom: 0;
    margin: 0;
    width: 100%;
    height: 100%;
  }

  #app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  p {
    margin: 0;
  }

  * {
    font-family: sans-serif;
  }

  .login-dialog {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000000AA;
    z-index: 1010;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-card {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .session-expired {
    margin: 0;
    padding: 0 28px;
    font-weight: normal;
    font-size: 28px;
  }

  .login-button {
    margin-top: 28px;
  }

  .main-container {
    width: 100%;
    flex-grow: 1;
    background-color: #e8e8e8
  }
</style>
