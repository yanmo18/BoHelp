<template>
  <div class="login-page" @mousemove="handleMouseMove">
    <!-- 背景气泡 -->
    <div class="bubble" v-for="i in 15" :key="i" :class="`bubble-${i % 5 + 1}`"></div>
    
    <!-- 背景小怪兽 -->
    <div class="monster" v-for="i in 5" :key="`monster-${i}`" :class="`monster-${i}`" :style="getMonsterStyle(i)"></div>
    
    <div class="login-box">
      <div class="login-logo">
        <h1>博城帮</h1>
        <p>社区互助平台管理后台</p>
      </div>
      
      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <button 
          class="tab-button" 
          :class="{ active: loginMethod === 'phone' }"
          @click="switchLoginMethod('phone')"
        >
          手机号密码登录
        </button>
        <button 
          class="tab-button" 
          :class="{ active: loginMethod === 'sms' }"
          @click="switchLoginMethod('sms')"
        >
          验证码登录
        </button>
        <button 
          class="tab-button" 
          :class="{ active: loginMethod === 'wechat' }"
          @click="switchLoginMethod('wechat')"
        >
          微信登录
        </button>
      </div>
      
      <!-- 手机号密码登录 -->
      <form @submit.prevent="handlePhonePasswordLogin" v-if="loginMethod === 'phone'">
        <div class="form-group">
          <label for="phone" class="form-label">手机号</label>
          <input
            type="tel"
            id="phone"
            v-model="phonePasswordForm.phone"
            class="form-control"
            placeholder="请输入手机号"
            required
          />
        </div>
        <div class="form-group password-group">
          <label for="password" class="form-label">密码</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="phonePasswordForm.password"
              class="form-control password-input"
              placeholder="请输入密码"
              required
            />
            <button type="button" class="password-toggle" @click="togglePassword">
              <div class="eye" :class="{ 'eye-closed': !isEyeOpen }">
                <div class="pupil" :style="pupilStyle" v-if="isEyeOpen"></div>
                <div class="eye-lid" v-else></div>
              </div>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="captcha" class="form-label">验证码</label>
          <div class="captcha-container">
            <input
              type="text"
              id="captcha"
              v-model="phonePasswordForm.captcha"
              class="form-control captcha-input"
              placeholder="请输入验证码"
              required
            />
            <div class="captcha-image" @click="generateCaptcha">
              {{ captcha || '点击生成' }}
            </div>
          </div>
        </div>
        <div class="form-group remember-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="phonePasswordForm.remember" />
            <span class="checkbox-text">记住密码</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="switchLoginMethod('sms')">忘记密码？</a>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="login-tips" style="margin-top: 15px; text-align: center; font-size: 12px; color: var(--neutral-dark);">
          提示：默认手机号为 13800138000，密码为 admin，验证码为图片中的字符
        </div>
      </form>
      
      <!-- 验证码登录 -->
      <form @submit.prevent="handleSmsLogin" v-else-if="loginMethod === 'sms'">
        <div class="form-group">
          <label for="smsPhone" class="form-label">手机号</label>
          <input
            type="tel"
            id="smsPhone"
            v-model="smsForm.phone"
            class="form-control"
            placeholder="请输入手机号"
            required
          />
        </div>
        <div class="form-group">
          <label for="smsCode" class="form-label">验证码</label>
          <div class="captcha-container">
            <input
              type="text"
              id="smsCode"
              v-model="smsForm.smsCode"
              class="form-control captcha-input"
              placeholder="请输入验证码"
              required
            />
            <button 
              type="button" 
              class="btn btn-secondary" 
              :disabled="countdown > 0"
              @click="sendSmsCode"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="login-tips" style="margin-top: 15px; text-align: center; font-size: 12px; color: var(--neutral-dark);">
          提示：默认手机号为 13800138000，验证码为 1234
        </div>
      </form>
      
      <!-- 微信登录 -->
      <div class="wechat-login" v-else-if="loginMethod === 'wechat'">
        <div class="wechat-qrcode">
          <div class="qrcode-placeholder">
            <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wechat%20login%20qrcode%20placeholder&image_size=square" alt="微信登录二维码" />
          </div>
          <p class="wechat-tips">请使用微信扫码登录</p>
          <p class="wechat-note">* 需先绑定微信账号</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed } from 'vue'
import { useRouter } from 'vue-router'

const showToast = inject('showToast') as (message: string, type?: 'success' | 'error' | 'info') => void

const router = useRouter()

// 登录方式
const loginMethod = ref('phone') // phone: 手机号密码登录, sms: 验证码登录, wechat: 微信登录

// 切换登录方式
const switchLoginMethod = (method: string) => {
  console.log('切换登录方式:', method)
  loginMethod.value = method
  console.log('当前登录方式:', loginMethod.value)
}

// 手机号密码登录表单
const phonePasswordForm = ref({
  phone: '',
  password: '',
  captcha: '',
  remember: false
})

// 验证码登录表单
const smsForm = ref({
  phone: '',
  smsCode: ''
})

const loading = ref(false)
const showPassword = ref(false)
const captcha = ref('')
const countdown = ref(0)

// 鼠标位置
const mouseX = ref(0)
const mouseY = ref(0)

// 眼睛位置
const eyeX = ref(0)
const eyeY = ref(0)

// 眼睛状态
const isEyeOpen = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
  isEyeOpen.value = !isEyeOpen.value
  console.log('密码可见性切换:', showPassword.value, '眼睛状态:', isEyeOpen.value)
}

const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captcha.value = result
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendSmsCode = () => {
  const phone = smsForm.value.phone
  if (!phone || phone.length !== 11) {
    showToast('请输入正确的手机号', 'error')
    return
  }
  
  // 模拟发送验证码
  showToast('验证码已发送', 'success')
  startCountdown()
}

const handlePhonePasswordLogin = async () => {
  try {
    loading.value = true
    
    // 验证验证码
    if (phonePasswordForm.value.captcha.toUpperCase() !== captcha.value.toUpperCase()) {
      showToast('验证码错误', 'error')
      generateCaptcha()
      return
    }
    
    // 调用后端API
    console.log('开始登录请求:', phonePasswordForm.value.phone)
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phonePasswordForm.value.phone,
          password: phonePasswordForm.value.password
        })
      })
      console.log('登录请求响应:', response)
      
      if (response.ok) {
        const data = await response.json()
        console.log('登录成功，返回数据:', data)
        
        // 存储token和用户信息
        if (data.access_token) {
          localStorage.setItem('token', data.access_token)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          // 兼容旧版本API
          localStorage.setItem('token', 'mock-token')
          localStorage.setItem('user', JSON.stringify(data))
        }
        
        // 记住密码
        if (phonePasswordForm.value.remember) {
          localStorage.setItem('phone', phonePasswordForm.value.phone)
          localStorage.setItem('password', phonePasswordForm.value.password)
        } else {
          localStorage.removeItem('phone')
          localStorage.removeItem('password')
        }
        
        // 跳转到首页
        router.push('/dashboard')
      } else {
        try {
          const error = await response.json()
          console.log('登录失败，错误信息:', error)
          showToast(error.message || '手机号或密码错误', 'error')
        } catch (e) {
          console.log('登录失败，无法解析错误信息')
          showToast('登录失败，服务器错误', 'error')
        }
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError)
      
      // 模拟登录（用于开发环境）
      if (phonePasswordForm.value.phone === '13800138000' && phonePasswordForm.value.password === 'admin') {
        console.log('模拟登录成功')
        const mockUser = {
          id: 1,
          phone: '13800138000',
          username: 'admin',
          realName: '管理员',
          role: 'ADMIN'
        }
        // 存储token
        localStorage.setItem('token', 'mock-token')
        localStorage.setItem('user', JSON.stringify(mockUser))
        
        // 记住密码
        if (phonePasswordForm.value.remember) {
          localStorage.setItem('phone', phonePasswordForm.value.phone)
          localStorage.setItem('password', phonePasswordForm.value.password)
        } else {
          localStorage.removeItem('phone')
          localStorage.removeItem('password')
        }
        
        // 跳转到首页
        router.push('/dashboard')
      } else {
        showToast('登录失败，请检查网络连接或服务器状态', 'error')
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const handleSmsLogin = async () => {
  try {
    loading.value = true
    
    // 调用后端API
    console.log('开始短信登录请求:', smsForm.value.phone)
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/user/login/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: smsForm.value.phone,
          smsCode: smsForm.value.smsCode
        })
      })
      console.log('短信登录请求响应:', response)
      
      if (response.ok) {
        const data = await response.json()
        console.log('短信登录成功，返回数据:', data)
        
        // 存储token和用户信息
        if (data.access_token) {
          localStorage.setItem('token', data.access_token)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          // 兼容旧版本API
          localStorage.setItem('token', 'mock-token')
          localStorage.setItem('user', JSON.stringify(data))
        }
        
        // 跳转到首页
        router.push('/dashboard')
      } else {
        try {
          const error = await response.json()
          console.log('短信登录失败，错误信息:', error)
          showToast(error.message || '手机号或验证码错误', 'error')
        } catch (e) {
          console.log('短信登录失败，无法解析错误信息')
          showToast('登录失败，服务器错误', 'error')
        }
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError)
      
      // 模拟登录（用于开发环境）
      if (smsForm.value.phone === '13800138000' && smsForm.value.smsCode === '1234') {
        console.log('模拟短信登录成功')
        const mockUser = {
          id: 1,
          phone: '13800138000',
          username: 'admin',
          realName: '管理员',
          role: 'ADMIN'
        }
        // 存储token
        localStorage.setItem('token', 'mock-token')
        localStorage.setItem('user', JSON.stringify(mockUser))
        
        // 跳转到首页
        router.push('/dashboard')
      } else {
        showToast('登录失败，请检查网络连接或服务器状态', 'error')
      }
    }
  } catch (error) {
    console.error('短信登录失败:', error)
    showToast('登录失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const loadSavedCredentials = () => {
  const savedPhone = localStorage.getItem('phone')
  const savedPassword = localStorage.getItem('password')
  if (savedPhone && savedPassword) {
    phonePasswordForm.value.phone = savedPhone
    phonePasswordForm.value.password = savedPassword
    phonePasswordForm.value.remember = true
  }
}

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  
  // 更新背景样式跟随鼠标
  const loginPage = document.querySelector('.login-page') as HTMLElement
  if (loginPage) {
    loginPage.style.setProperty('--mouse-x', `${event.clientX}px`)
    loginPage.style.setProperty('--mouse-y', `${event.clientY}px`)
  }
  
  // 让眼球跟随整个页面的鼠标移动
  const eyeRect = document.querySelector('.password-toggle')?.getBoundingClientRect()
  
  if (eyeRect) {
    const eyeCenterX = eyeRect.left + eyeRect.width / 2
    const eyeCenterY = eyeRect.top + eyeRect.height / 2
    
    const deltaX = event.clientX - eyeCenterX
    const deltaY = event.clientY - eyeCenterY
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = 4 // 限制眼球移动范围，确保在眼睛内部
    
    let normalizedX = 0
    let normalizedY = 0
    
    if (distance > 0) {
      normalizedX = deltaX / distance
      normalizedY = deltaY / distance
    }
    
    // 确保眼球在眼睛内部
    eyeX.value = Math.max(-maxDistance, Math.min(maxDistance, normalizedX * maxDistance))
    eyeY.value = Math.max(-maxDistance, Math.min(maxDistance, normalizedY * maxDistance))
  }
}



// 眼睛样式
const pupilStyle = computed(() => {
  return {
    transform: `translate(${eyeX.value}px, ${eyeY.value}px)`
  }
})

// 获取小怪兽样式
const getMonsterStyle = (index: number) => {
  const baseSize = 50 + index * 20
  const speed = 0.001 * (index + 1)
  const time = Date.now() * speed
  
  const x = 10 + Math.sin(time) * 20
  const y = 10 + Math.cos(time) * 15
  
  return {
    transform: `translate(${x}px, ${y}px)`,
    width: `${baseSize}px`,
    height: `${baseSize}px`
  }
}

onMounted(() => {
  generateCaptcha()
  loadSavedCredentials()
})
</script>

<style scoped>
/* 全局鼠标样式 */
.login-page {
  cursor: default;
  /* 放大默认光标 */
  --cursor-size: 18px;
  font-size: var(--cursor-size);
}

.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--neutral-light);
  background-image: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(216, 31, 38, 0.15) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(245, 245, 245, 1) 100%);
  position: relative;
  overflow: hidden;
  width: 100%;
  margin: 0;
  padding: 0;
  transition: background-position 0.1s ease;
  background-size: 150% 150%;
  animation: backgroundPulse 3s ease-in-out infinite;
}

@keyframes backgroundPulse {
  0%, 100% {
    background-size: 150% 150%;
  }
  50% {
    background-size: 160% 160%;
  }
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

/* 背景小怪兽样式 */
.monster {
  position: absolute;
  background-color: rgba(216, 31, 38, 0.8);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  z-index: 1;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.monster::before {
  content: '👾';
  font-size: 24px;
}

.monster-1 {
  top: 15%;
  left: 5%;
  animation: monsterMove 8s ease-in-out infinite;
}

.monster-2 {
  top: 25%;
  right: 10%;
  background-color: rgba(0, 0, 0, 0.8);
  animation: monsterMove 10s ease-in-out infinite reverse;
}

.monster-3 {
  bottom: 20%;
  left: 15%;
  background-color: rgba(216, 31, 38, 0.6);
  animation: monsterMove 7s ease-in-out infinite;
}

.monster-4 {
  bottom: 15%;
  right: 15%;
  background-color: rgba(0, 0, 0, 0.6);
  animation: monsterMove 9s ease-in-out infinite reverse;
}

.monster-5 {
  top: 40%;
  right: 25%;
  background-color: rgba(216, 31, 38, 0.7);
  animation: monsterMove 6s ease-in-out infinite;
}

@keyframes monsterMove {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(5deg);
  }
  50% {
    transform: translate(0, 20px) rotate(0deg);
  }
  75% {
    transform: translate(-20px, -10px) rotate(-5deg);
  }
}

.login-box {
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
  cursor: inherit;
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
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.password-toggle:hover {
  background-color: rgba(216, 31, 38, 0.1);
  color: var(--primary-color);
}

/* 眼睛样式 */
.eye {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid var(--neutral-dark);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.eye.eye-closed {
  background-color: white;
  border-color: var(--neutral-dark);
}

.eye-lid {
  width: 100%;
  height: 100%;
  position: relative;
  animation: blink 0.3s ease;
}

/* 上眼睑和眼睫毛 */
.eye-lid::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -10%;
  width: 120%;
  height: 2px;
  background-color: var(--neutral-dark);
  border-radius: 1px;
  transform: translateY(-50%);
  box-shadow: 0 0 0 2px var(--neutral-dark), 
              -8px -2px 0 0 var(--neutral-dark), 
              -4px -3px 0 0 var(--neutral-dark), 
              0 -3px 0 0 var(--neutral-dark), 
              4px -3px 0 0 var(--neutral-dark), 
              8px -2px 0 0 var(--neutral-dark);
}

/* 下眼睑和眼睫毛 */
.eye-lid::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -10%;
  width: 120%;
  height: 2px;
  background-color: var(--neutral-dark);
  border-radius: 1px;
  transform: translateY(-50%) rotate(180deg);
  box-shadow: 0 0 0 2px var(--neutral-dark), 
              -8px 2px 0 0 var(--neutral-dark), 
              -4px 3px 0 0 var(--neutral-dark), 
              0 3px 0 0 var(--neutral-dark), 
              4px 3px 0 0 var(--neutral-dark), 
              8px 2px 0 0 var(--neutral-dark);
}

@keyframes blink {
  0% {
    transform: scaleY(0);
  }
  50% {
    transform: scaleY(0.5);
  }
  100% {
    transform: scaleY(1);
  }
}

.pupil {
  width: 8px;
  height: 8px;
  background-color: var(--secondary-color);
  border-radius: 50%;
  transition: transform 0.1s ease;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

.remember-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.forgot-password {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  text-decoration: none;
  transition: color var(--transition-fast);
  cursor: inherit;
}

.forgot-password:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.checkbox-label input[type="checkbox"] {
  margin-right: var(--spacing-xs);
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
  cursor: inherit;
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
  cursor: inherit;
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

/* 登录方式切换标签 */
.login-tabs {
  display: flex;
  margin-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.tab-button {
  flex: 1;
  padding: var(--spacing-md);
  background: none;
  border: none;
  font-size: var(--font-size-base);
  color: var(--neutral-dark);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.tab-button:hover {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

/* 微信登录样式 */
.wechat-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) 0;
}

.wechat-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--white);
}

.qrcode-placeholder img {
  width: 180px;
  height: 180px;
  border-radius: var(--border-radius-sm);
}

.wechat-tips {
  font-size: var(--font-size-base);
  color: var(--secondary-color);
  font-weight: 500;
}

.wechat-note {
  font-size: var(--font-size-sm);
  color: var(--neutral-dark);
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-box {
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
  
  .login-tabs {
    flex-direction: column;
  }
  
  .tab-button {
    text-align: center;
    border-bottom: 1px solid var(--border-color);
  }
  
  .tab-button.active::after {
    left: 20%;
    width: 60%;
  }
  
  .qrcode-placeholder {
    width: 160px;
    height: 160px;
  }
  
  .qrcode-placeholder img {
    width: 140px;
    height: 140px;
  }
  
  .monster {
    transform: scale(0.7);
  }
}
</style>
