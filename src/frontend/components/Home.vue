<template>

	<div>
    <div class="sign-in-message-container" v-if="!signedIn">
      <p class="sign-in-title">Weclome</p>
      <p class="sign-in-message">Start by signing in</p>
    </div>
    <div class="navigation-links" v-if="signedIn">
      <router-link to="/backup">Backup messages</router-link>
      <router-link to="/archive">View archive</router-link>
    </div>
	</div>

</template>




<script>
  import {isSignedIn} from '../utils/session'

	export default {
    computed: {
      signedIn: isSignedIn
    }
  }

</script>




<style scoped>

  p {
    font-family: sans-serif;
  }

  .sign-in-message-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .sign-in-title {
    font-size: 38px;
    margin: 38px 0 12px 0;
  }

  .sign-in-message {
    font-size: 11px;
  }

</style>
