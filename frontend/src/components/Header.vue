<template>
  <header>
    <router-link class="title" to="/"> Slack Archive </router-link>
    <span v-if="loggedIn">
      <router-link :class="{ 'nav-link': true, 'nav-selected': this.isArchivePage }" to="archive">Archive</router-link>
      <router-link :class="{ 'nav-link': true, 'nav-selected': this.isBackupsPage }" to="backup">Backup</router-link>
    </span>
  </header>
</template>

<script>
import { isLoggedIn } from '../util/session'

export default {
  data () {
    return {
      loggedIn: isLoggedIn(),
      isArchivePage: this.$router.currentRoute.path.match('/archive') != null,
      isBackupsPage: this.$router.currentRoute.path.match('/backup') != null
    }
  },
  watch: {
    $route (to) {
      this.isArchivePage = to.path.match('/archive') != null
      this.isBackupsPage = to.path.match('/backup') != null
    }
  },
  methods: {

  }
}
</script>

<style scoped>
  header {
    height: 72px;
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
    font-family: sans-serif;
    font-weight: bold;
    color: white;
    font-size: 28px;
  }

  .nav-link {
    font-family: sans-serif;
    font-weight: bold;
    font-size: 18px;
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
