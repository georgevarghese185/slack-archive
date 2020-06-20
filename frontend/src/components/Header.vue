<template>
  <header>
    <router-link class="title" to="/"> Slack Archive </router-link>
    <span v-if="loggedIn">
      <router-link :class="{ 'nav-link': true, 'nav-selected': this.isArchivePage }" :to="{ name: 'Archive' }">Archive</router-link>
      <router-link :class="{ 'nav-link': true, 'nav-selected': this.isBackupsPage }" :to="{ name: 'Backup' }">Backup</router-link>
      <span class="nav-link" @click="signOut">Sign Out</span>
    </span>
  </header>
</template>

<script>
import { isLoggedIn, logout } from '../util/session'

export default {
  data () {
    return {
      loggedIn: isLoggedIn()
    }
  },
  computed: {
    isArchivePage () {
      return this.$route.name === 'Archive'
    },
    isBackupsPage () {
      return this.$route.name === 'Backups'
    }
  },
  methods: {
    signOut: async function () {
      await logout()
      window.location.href = window.location.origin
    }
  }
}
</script>

<style scoped>
  header {
    height: 58px;
    background-color: #680763;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px 0 30px;
    box-shadow: 0px -3px 8px 2px #00000087;
    position: relative;
    z-index: 1000;
  }

  .title {
    text-decoration: none;
    color: white;
    font-size: 26px;
  }

  .nav-link {
    cursor: pointer;
    font-size: 16px;
    color: white;
    text-decoration: none;
    margin: 0 6px 0 6px;
    padding: 10px;
    text-align: center;
    border-radius: 4px;
  }

  .nav-selected, .nav-link:hover {
    background: #7d457b;
  }
</style>
