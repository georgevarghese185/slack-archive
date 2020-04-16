import Vue from 'vue'
import VueRouter from 'vue-router'
import Archive from '../views/Archive.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/archive',
    name: 'Archive',
    component: Archive
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
