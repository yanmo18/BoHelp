<template>
  <div class="login-container">
    <!-- 背景气泡 -->
    <div class="bubble" v-for="i in 15" :key="i" :class="`bubble-${i % 5 + 1}`"></div>
    
    <div class="login-form">
      <div class="login-logo">
        <h1>博城帮</h1>
        <p>社区互助平台管理后台</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            type="text"
            id="username"
            v-model="loginForm.username"
            class="form-control"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group password-group">
          <label for="password" class="form-label">密码</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="loginForm.password"
              class="form-control password-input"
              placeholder="请输入密码"
              required
            />
            <button type="button" class="password-toggle" @click="togglePassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="captcha" class="form-label">验证码</label>
          <div class="captcha-container">
            <input
              type="text"
              id="captcha"
              v-model="loginForm.captcha"
              class="form-control captcha-input"
              placeholder="请输入验证码"
              required
            />
            <div class="captcha-image" @click="generateCaptcha">
              {{ captcha }}
            </div>
          </div>
        </div>
        <div class="form-group remember-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="loginForm.remember" />
            <span class="checkbox-text">记住密码</span>
          </label>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="login-tips" style="margin-top: 15px; text-align: center; font-size: 12px; color: var(--neutral-dark);">
          提示：默认用户名和密码均为 admin，验证码为图片中的字符
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const showToast = inject('showToast') as (message: string, type?: 'success' | 'error' | 'info') => void

const router = useRouter()

const loginForm = ref({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

const loading = ref(false)
const showPassword = ref(false)
const captcha = ref('')

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captcha.value = result
}

const handleLogin = async () => {
  try {
    loading.value = true
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟登录成功
    if (loginForm.value.username === 'admin' && loginForm.value.password === 'admin' && loginForm.value.captcha.toUpperCase() === captcha.value.toUpperCase()) {
      // 存储token
      localStorage.setItem('token', 'mock-token')
      
      // 记住密码
      if (loginForm.value.remember) {
        localStorage.setItem('username', loginForm.value.username)
        localStorage.setItem('password', loginForm.value.password)
      } else {
        localStorage.removeItem('username')
        localStorage.removeItem('password')
      }
      
      // 跳转到首页
      router.push('/dashboard')
    } else if (loginForm.value.captcha.toUpperCase() !== captcha.value.toUpperCase()) {
      showToast('验证码错误', 'error')
      generateCaptcha()
    } else {
      showToast('用户名或密码错误', 'error')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const loadSavedCredentials = () => {
  const savedUsername = localStorage.getItem('username')
  const savedPassword = localStorage.getItem('password')
  if (savedUsername && savedPassword) {
    loginForm.value.username = savedUsername
    loginForm.value.password = savedPassword
    loginForm.value.remember = true
  }
}

onMounted(() => {
  generateCaptcha()
  loadSavedCredentials()
})
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--neutral-light);
  background-image: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  position: relative;
  overflow: hidden;
}

/* 背景气泡样式 */
.bubble {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(216, 31, 38, 0.1);
  animation: float ease-in-out infinite;
}

.bubble-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 10%;
  animation-duration: 8s;
}

.bubble-2 {
  width: 150px;
  height: 150px;
  top: 20%;
  right: 15%;
  animation-duration: 10s;
}

.bubble-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-duration: 6s;
}

.bubble-4 {
  width: 120px;
  height: 120px;
  bottom: 10%;
  right: 10%;
  animation-duration: 9s;
}

.bubble-5 {
  width: 60px;
  height: 60px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-duration: 7s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

.login-form {
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xl);
  width: 400px;
  max-width: 90%;
  animation: slideIn 0.5s ease-out;
  position: relative;
  z-index: 10;
}

.login-logo {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-logo h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 2px 4px rgba(216, 31, 38, 0.2);
}

.login-logo p {
  color: var(--neutral-dark);
  font-size: var(--font-size-sm);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--secondary-color);
}

.form-control {
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  border-bottom: 2px solid var(--border-color);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  background-color: transparent;
}

.form-control:focus {
  outline: none;
  border-bottom-color: var(--primary-color);
  transform: translateY(-2px);
}

/* 密码输入框样式 */
.password-group {
  position: relative;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  flex: 1;
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  color: var(--neutral-dark);
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--primary-color);
}

/* 验证码输入框样式 */
.captcha-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 100px;
  height: 40px;
  background-color: var(--neutral-light);
  border-radius: var(--border-radius-sm);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
  user-select: none;
}

.captcha-image:hover {
  background-color: var(--primary-color);
  color: var(--white);
  transform: scale(1.05);
}

/* 记住密码样式 */
.remember-group {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--neutral-dark);
}

.checkbox-label input[type="checkbox"] {
  margin-right: var(--spacing-xs);
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
}

.checkbox-text {
  font-size: var(--font-size-sm);
}

.btn-primary {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: 600;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-form {
    padding: var(--spacing-lg);
  }
  
  .captcha-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .captcha-image {
    width: 100%;
    height: 50px;
  }
}
</style>
