import Vue from 'vue'
import VueRouter from 'vue-router'
import Archive from '../views/Archive.vue'
import Backup from '../views/Backup.vue'
import SignIn from '../views/SignIn.vue'
import OauthRedirect from '../views/OauthRedirect.vue'
import { isLoggedIn } from '../util/session'

Vue.use(VueRouter)

const routes = isLoggedIn() ? [
  {
    path: '/archive/:conversationId?/:ts?',
    name: 'Archive',
    component: Archive
  },
  {
    path: '/backup',
    name: 'Backup',
    component: Backup
  },
  {
    path: '*',
    redirect: '/archive'
  }
] : [
  {
    path: '/sign-in',
    name: 'SignIn',
    component: SignIn
  },
  {
    path: '/oauth/redirect',
    name: 'OauthRedirect',
    component: OauthRedirect
  },
  {
    path: '*',
    redirect: '/sign-in'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
