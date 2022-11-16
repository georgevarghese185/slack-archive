<template>
  <div class="oauth-redirect">
    <Card class="please-wait-card">
      <div class="please-wait-container">Please wait...</div>
    </Card>
  </div>
</template>

<script>
import Card from '../components/Card'
import { completeLogin } from '../util/session'

export default {
  mounted: async function () {
    const { code, state } = this.$router.currentRoute.query

    try {
      const validLogin = await completeLogin(code, state)

      if (validLogin) {
        window.location.href = window.location.origin // refresh to home page
      } else {
        this.$router.push('/sign-in')
      }
    } catch (e) {
      console.error(e)
      // TODO handle error
    }
  },
  components: {
    Card
  }
}
</script>

<style scoped>
  .oauth-redirect {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .please-wait-card {
    margin-top: 46px;
    min-width: 475px;
    min-height: 135px;
  }

  .please-wait-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 475px;
    min-height: 135px;
    font-size: 16px;
  }
</style>
