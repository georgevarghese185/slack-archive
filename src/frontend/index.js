import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './components/App.vue';
import Archive from './components/Archive.vue'
import Home from './components/Home.vue'
import SignIn from './components/SignIn.vue'

window.addEventListener('load', function() {
  Vue.use(VueRouter);

  const router = new VueRouter({
    routes: [
      {path: '/archive', component: Archive},
      {path: '/sign-in', component: SignIn},
      {path: '/', component: Home}
    ]
  });

  new Vue({
    el: "#app",
    router,
    render: createElement => createElement(App)
  });
})
