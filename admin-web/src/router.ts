import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import UserManagementView from './views/UserManagementView.vue'
import TakeawayOrderView from './views/TakeawayOrderView.vue'
import TakeitOrderView from './views/TakeitOrderView.vue'
import TaskOrderView from './views/TaskOrderView.vue'
import NoticeManagementView from './views/NoticeManagementView.vue'
import VillageManagementView from './views/VillageManagementView.vue'
import ProfileView from './views/ProfileView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: '登录' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: '后台首页' }
  },
  {
    path: '/user-management',
    name: 'user-management',
    component: UserManagementView,
    meta: { title: '用户管理' }
  },
  {
    path: '/takeaway-order',
    name: 'takeaway-order',
    component: TakeawayOrderView,
    meta: { title: '外卖订单管理' }
  },
  {
    path: '/takeit-order',
    name: 'takeit-order',
    component: TakeitOrderView,
    meta: { title: '代拿订单管理' }
  },
  {
    path: '/task-order',
    name: 'task-order',
    component: TaskOrderView,
    meta: { title: '悬赏订单管理' }
  },
  {
    path: '/notice-management',
    name: 'notice-management',
    component: NoticeManagementView,
    meta: { title: '公告管理' }
  },
  {
    path: '/village-management',
    name: 'village-management',
    component: VillageManagementView,
    meta: { title: '村庄管理' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: '个人资料' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = `博城帮管理后台 - ${to.meta.title}`
  next()
})

export default router
