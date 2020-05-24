import Vue from 'vue'
import VueRouter from 'vue-router'
import Archive from '../views/Archive.vue'
import SignIn from '../views/SignIn.vue'
import { isLoggedIn } from '../util/session'

Vue.use(VueRouter)

const routes = isLoggedIn() ? [
  {
    path: '/archive',
    name: 'Archive',
    component: Archive
  }, {
    path: '*',
    redirect: '/archive'
  }
] : [
  {
    path: '*',
    name: 'SignIn',
    component: SignIn
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
