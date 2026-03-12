<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <aside class="sidebar" v-if="$route.name !== 'login'">
      <div class="sidebar-header">
        博城帮管理后台
      </div>
      <ul class="sidebar-menu">
        <li class="sidebar-menu-item">
          <router-link to="/dashboard" class="sidebar-menu-link" :class="{ active: $route.name === 'dashboard' }">
            后台首页
          </router-link>
        </li>
        <li class="sidebar-menu-item">
          <router-link to="/user-management" class="sidebar-menu-link" :class="{ active: $route.name === 'user-management' }">
            用户管理
          </router-link>
        </li>
        <li class="sidebar-menu-item">
          <router-link to="/takeaway-order" class="sidebar-menu-link" :class="{ active: $route.name === 'takeaway-order' }">
            外卖订单管理
          </router-link>
        </li>
        <li class="sidebar-menu-item">
          <router-link to="/takeit-order" class="sidebar-menu-link" :class="{ active: $route.name === 'takeit-order' }">
            代拿订单管理
          </router-link>
        </li>
        <li class="sidebar-menu-item">
          <router-link to="/task-order" class="sidebar-menu-link" :class="{ active: $route.name === 'task-order' }">
            悬赏订单管理
          </router-link>
        </li>
        <li class="sidebar-menu-item">
          <router-link to="/notice-management" class="sidebar-menu-link" :class="{ active: $route.name === 'notice-management' }">
            公告管理
          </router-link>
        </li>
        <li class="sidebar-menu-item">
          <router-link to="/village-management" class="sidebar-menu-link" :class="{ active: $route.name === 'village-management' }">
            村庄管理
          </router-link>
        </li>
      </ul>
      <div class="sidebar-footer">
        <li class="sidebar-menu-item">
          <a href="/login" class="sidebar-menu-link logout-btn" @click.prevent="logout">
            退出登录
          </a>
        </li>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content" v-if="$route.name !== 'login'">
      <div class="content-header">
        <div class="header-left">
          <h1>{{ $route.meta.title }}</h1>
          <div class="breadcrumb">
            <span class="breadcrumb-item">首页</span>
            <span class="breadcrumb-item">{{ $route.meta.title }}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <div class="user-avatar" @mouseenter="showUserMenu" @mouseleave="hideUserMenu">
              <img :src="user.avatar" alt="用户头像" />
              <div class="user-menu" v-if="userMenuVisible" @mouseenter="showUserMenu" @mouseleave="hideUserMenu">
                <a href="#" @click.prevent="goToProfile">个人资料</a>
                <a href="#" @click.prevent="logout">退出登录</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content-body">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 登录页面 -->
    <router-view v-if="$route.name === 'login'" />
    
    <!-- 全局Toast提示 -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast" 
        :class="toast.type"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref({
  name: '管理员',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar%20portrait%20simple%20style&image_size=square'
})

const userMenuVisible = ref(false)
let hideTimer: number | null = null

// Toast管理
const toasts = ref<Array<{id: number, message: string, type: string}>>([])
let toastId = 0

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const id = toastId++
  
  // 限制最多显示2条
  if (toasts.value.length >= 2) {
    // 移除最早的toast
    toasts.value.shift()
  }
  
  toasts.value.push({ id, message, type })
  
  // 5秒后自动移除
  setTimeout(() => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }, 5000)
}

// 暴露给子组件使用
provide('showToast', showToast)

const logout = () => {
  // 清除登录状态
  localStorage.removeItem('token')
  // 跳转到登录页
  router.push('/login')
}

const showUserMenu = () => {
  // 清除之前的定时器
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  userMenuVisible.value = true
}

const hideUserMenu = () => {
  // 添加延迟，鼠标离开后保持5秒才消失
  hideTimer = window.setTimeout(() => {
    userMenuVisible.value = false
    hideTimer = null
  }, 5000)
}

const goToProfile = () => {
  // 跳转到个人资料页面
  router.push('/profile')
  userMenuVisible.value = false
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

/* Toast样式 */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  padding: 16px 24px;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  color: var(--white);
  font-size: var(--font-size-base);
  font-weight: 600;
  animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1), fadeOut 0.5s ease-in 4.5s;
  opacity: 1;
  transition: all 0.3s ease;
  min-width: 220px;
  max-width: 320px;
  word-wrap: break-word;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 10% 100%);
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
}

.toast::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%);
  animation: tailFade 5s ease-out;
}

@keyframes tailFade {
  0% {
    width: 0;
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0;
  }
}

.toast.success {
  background-color: rgba(216, 31, 38, 0.9);
  background: linear-gradient(135deg, rgba(216, 31, 38, 0.9) 0%, rgba(180, 25, 30, 0.95) 100%);
  box-shadow: 0 8px 24px rgba(216, 31, 38, 0.4);
}

.toast.error {
  background-color: rgba(0, 0, 0, 0.9);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 30, 30, 0.95) 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.toast.error::after {
  background: linear-gradient(90deg, rgba(216, 31, 38, 0.8) 0%, rgba(216, 31, 38, 0) 100%);
}

.toast.info {
  background-color: rgba(216, 31, 38, 0.8);
  background: linear-gradient(135deg, rgba(216, 31, 38, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%);
  box-shadow: 0 8px 24px rgba(216, 31, 38, 0.3);
}

.toast:hover {
  transform: translateY(-4px) translateX(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%) translateY(20px);
    opacity: 0;
    filter: blur(10px);
  }
  to {
    transform: translateX(0) translateY(0);
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(0) translateY(0);
    filter: blur(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%) translateY(20px);
    filter: blur(10px);
  }
}

/* 用户信息和菜单样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-name {
  font-weight: 500;
  color: var(--secondary-color);
}

.user-avatar {
  position: relative;
  cursor: pointer;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  transition: all var(--transition-fast);
}

.user-avatar:hover img {
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 120px;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease-out;
}

.user-menu a {
  display: block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--secondary-color);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.user-menu a:hover {
  background-color: var(--primary-color);
  color: var(--white);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
