<template>
  <div class="sign-in-container">
    <Card class="welcome-card">
      <div class="card-inner-container">
        <p class="welcome">Welcome to Slack Archive</p>
        <p class="instructions">To begin, sign into your workspace and give Slack Archive access to read your public channels</p>
        <button :class="{'sign-in': true, 'signing-in': this.signingIn}" @click="signIn">
          <p v-if="!signingIn">Sign In</p>
          <Spinner class="spinner" v-if="signingIn"/>
        </button>
      </div>
    </Card>
  </div>
</template>

<script>
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import { startLogin } from '../util/session'

export default {
  data () {
    return {
      signingIn: false
    }
  },
  methods: {
    signIn: async function () {
      this.signingIn = true
      try {
        await startLogin()
      } catch (e) {
        // TODO handle error
      }
    }
  },
  components: {
    Card,
    Spinner
  }
}
</script>

<style scoped>
  .sign-in-container {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .welcome-card {
    margin-top: 46px;
  }

  .card-inner-container {
    display:flex;
    flex-direction: column;
    align-items: center;
  }

  .welcome {
    text-align: center;
    font-size: 42px;
    font-weight: bold;
  }

  .instructions {
    margin-top: 15px;
    font-size: 18px;
  }

  .sign-in {
    margin-top: 48px;
    background: #680763;
    padding: 8px 12px 8px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    box-shadow: 0px 1px 6px 2px #0000000d;
    transition: background-color 0.5s;
  }

  .sign-in > p {
    color: white;
    font-size: 28px;
  }

  .sign-in:hover {
    background: #861280;
  }

  .sign-in.signing-in {
    background-color: #bfbfbf;
  }

  .spinner {
    color: white;
    width: 24px;
    margin: 0 8px 0 8px;
  }
</style>
