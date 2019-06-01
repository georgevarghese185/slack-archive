<template>

	<div class="sign-in-container">
    <p v-if="!signedIn && !successfulSignIn"> You will be redirected to slack</p>
		<p v-if="successfulSignIn"> You have singed in successfully </p>
		<p v-if="!successfulSignIn && signedIn"> You are already signed in </p>
	</div>

</template>




<script>
	import {setSignedIn} from '../utils/session';
	import {getSlackAuthUrl} from '../utils/api'

	export default {
    mounted() {
			if(this.successfulSignIn) {
				setSignedIn(this.$store);
			} else if(!this.signedIn) {
				getSlackAuthUrl()
					.then(url => window.location.href = url)
					.catch(e => console.error(e.errorResponse));
			}
    },

		computed: {
			signedIn() {
				return this.$store.state.signedIn;
			},
			successfulSignIn() {
				return this.$route.query.success == "true";
			}
		}
  }

</script>




<style scoped>

  p {
    font-family: sans-serif;
  }

  .sign-in-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

</style>
