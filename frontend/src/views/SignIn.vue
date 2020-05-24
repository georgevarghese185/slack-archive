<template>
  <div class="sign-in-container">
    <div class="card">
      <p class="welcome">Welcome to Slack Archive</p>
      <p class="instructions">To begin, sign into your workspace and give Slack Archive access to read public channels</p>
      <button :class="{'sign-in': true, 'signing-in': this.signingIn}" @click="signIn">
        <p v-if="!signingIn">Sign In</p>
        <Spinner class="spinner" v-if="signingIn"/>
      </button>
    </div>
  </div>
</template>

<script>
import Spinner from '../components/Spinner'

export default {
  data () {
    return {
      signingIn: false
    }
  },
  methods: {
    signIn () {
      this.signingIn = true
    }
  },
  components: {
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

  .card {
    display:flex;
    flex-direction: column;
    align-items: center;
    background: white;
    height: auto;
    padding: 32px;
    margin-top: 46px;
    border-radius: 8px;
    box-shadow: 0px 1px 6px 2px #0000000d;
  }

  .welcome {
    text-align: center;
    font-family: sans-serif;
    font-size: 42px;
    font-weight: bold;
  }

  .instructions {
    font-family: sans-serif;
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
    font-family: sans-serif;
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
