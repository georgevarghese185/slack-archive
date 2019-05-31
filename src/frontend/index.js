import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './components/App.vue';
import Archive from './components/Archive.vue'
import Home from './components/Home.vue'
import SignIn from './components/SignIn.vue'
import Routes from './routes'

window.addEventListener('load', function() {
  document.body.margin = 0;
  document.title = "Slack Archive";

  const div = document.createElement('div');
  div.id = "app";
  document.body.appendChild(div);

  Vue.use(VueRouter);

  const router = new VueRouter({
    routes: [
      {path: Routes.ARCHIVE, component: Archive},
      {path: Routes.SIGN_IN, component: SignIn},
      {path: '/', component: Home}
    ],
    mode: 'history'
  });

  new Vue({
    el: "#app",
    router,
    render: createElement => createElement(App)
  });
})
