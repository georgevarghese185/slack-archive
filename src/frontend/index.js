import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import App from './components/App.vue';
import Archive from './components/Archive.vue'
import Home from './components/Home.vue'
import SignIn from './components/SignIn.vue'
import SignOut from './components/SignOut.vue'
import Routes from './routes'
import {isSignedIn} from './utils/session'

window.addEventListener('load', function() {
  document.body.margin = 0;
  document.title = "Slack Archive";

  const div = document.createElement('div');
  div.id = "app";
  document.body.appendChild(div);

  Vue.use(Vuex);
  Vue.use(VueRouter);

  const store = new Vuex.Store({
    state: {
      signedIn: isSignedIn()
    },
    mutations: {
      signIn: state => state.signedIn = true,
      signOut: state => state.signedIn = false
    }
  })

  const router = new VueRouter({
    routes: [
      {path: Routes.ARCHIVE, component: Archive},
      {path: Routes.SIGN_IN, component: SignIn},
      {path: Routes.SIGN_OUT, component: SignOut},
      {path: '/', component: Home}
    ],
    mode: 'history'
  });

  new Vue({
    el: "#app",
    store,
    router,
    render: createElement => createElement(App)
  });
})
