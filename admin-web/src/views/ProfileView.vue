<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人资料</h2>
      <p>管理您的个人信息和账户设置</p>
    </div>

    <div class="profile-content">
      <!-- 个人信息卡片 -->
      <div class="card">
        <div class="card-header">
          <h3>基本信息</h3>
        </div>
        <div class="card-body">
          <div class="profile-header-section">
            <div class="avatar-container">
              <div class="avatar" :style="{ backgroundImage: `url(${userForm.avatar})` }">
                <input type="file" id="avatar-upload" class="avatar-upload-input" accept="image/*" @change="handleAvatarUpload" />
                <label for="avatar-upload" class="avatar-upload-label">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">更换头像</span>
                </label>
              </div>
            </div>
            <div class="profile-name">
              <h4>{{ userForm.name }}</h4>
              <p>{{ userForm.username }}</p>
            </div>
          </div>
          <div class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">用户名</label>
                <input type="text" v-model="userForm.username" class="form-control" disabled />
              </div>
              <div class="form-group">
                <label class="form-label">姓名</label>
                <input type="text" v-model="userForm.name" class="form-control" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">邮箱</label>
                <input type="email" v-model="userForm.email" class="form-control" />
              </div>
              <div class="form-group">
                <label class="form-label">手机号</label>
                <input type="tel" v-model="userForm.phone" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">角色</label>
              <input type="text" v-model="userForm.role" class="form-control" disabled />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="saveProfile">保存修改</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 密码修改卡片 -->
      <div class="card">
        <div class="card-header">
          <h3>密码修改</h3>
        </div>
        <div class="card-body">
          <div class="profile-form">
            <div class="form-group">
              <label class="form-label">当前密码</label>
              <input type="password" v-model="passwordForm.currentPassword" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">新密码</label>
              <input type="password" v-model="passwordForm.newPassword" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">确认新密码</label>
              <input type="password" v-model="passwordForm.confirmPassword" class="form-control" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="changePassword">修改密码</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 账户安全卡片 -->
      <div class="card">
        <div class="card-header">
          <h3>账户安全</h3>
        </div>
        <div class="card-body">
          <div class="security-info">
            <div class="security-item">
              <span class="security-label">邮箱验证</span>
              <span class="security-status" :class="{ active: userForm.emailVerified }">
                {{ userForm.emailVerified ? '已验证' : '未验证' }}
              </span>
              <button class="btn btn-secondary" v-if="!userForm.emailVerified">发送验证邮件</button>
            </div>
            <div class="security-item">
              <span class="security-label">手机验证</span>
              <span class="security-status" :class="{ active: userForm.phoneVerified }">
                {{ userForm.phoneVerified ? '已验证' : '未验证' }}
              </span>
              <button class="btn btn-secondary" v-if="!userForm.phoneVerified">发送验证码</button>
            </div>
            <div class="security-item">
              <span class="security-label">两步验证</span>
              <span class="security-status" :class="{ active: userForm.twoFactorEnabled }">
                {{ userForm.twoFactorEnabled ? '已开启' : '未开启' }}
              </span>
              <button class="btn btn-secondary">
                {{ userForm.twoFactorEnabled ? '关闭' : '开启' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

const showToast = inject('showToast') as (message: string, type?: 'success' | 'error' | 'info') => void

// const router = useRouter()

interface UserForm {
  username: string
  name: string
  email: string
  phone: string
  role: string
  avatar: string
  emailVerified: boolean
  phoneVerified: boolean
  twoFactorEnabled: boolean
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const userForm = ref<UserForm>({
  username: 'admin',
  name: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  role: '管理员',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait&image_size=square',
  emailVerified: true,
  phoneVerified: true,
  twoFactorEnabled: false
})

const passwordForm = ref<PasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const saveProfile = () => {
  // 模拟保存个人资料
  showToast('个人资料保存成功', 'success')
}

const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error')
      return
    }
    
    // 检查文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      showToast('图片大小不能超过2MB', 'error')
      return
    }
    
    // 读取文件并显示预览
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        userForm.value.avatar = e.target.result as string
        // 模拟上传到服务器
        setTimeout(() => {
          showToast('头像上传成功', 'success')
        }, 500)
      }
    }
    reader.readAsDataURL(file)
  }
}

const changePassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('两次输入的密码不一致', 'error')
    return
  }
  // 模拟修改密码
  showToast('密码修改成功', 'success')
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

onMounted(() => {
  // 模拟获取用户信息
  console.log('加载个人资料')
})
</script>

<style scoped>
.profile-container {
  padding: var(--spacing-md);
}

.profile-header {
  margin-bottom: var(--spacing-lg);
}

.profile-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: var(--spacing-xs);
}

.profile-header p {
  color: var(--neutral-dark);
  font-size: var(--font-size-base);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.profile-header-section {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.avatar-container {
  margin-right: var(--spacing-lg);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--neutral-light);
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  border: 3px solid var(--primary-color);
  transition: all var(--transition-fast);
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.avatar-upload-input {
  display: none;
}

.avatar-upload-label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
  color: var(--white);
  cursor: pointer;
}

.avatar:hover .avatar-upload-label {
  opacity: 1;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: var(--spacing-xs);
}

.upload-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.profile-name {
  flex: 1;
}

.profile-name h4 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--secondary-color);
  margin-bottom: var(--spacing-xs);
}

.profile-name p {
  color: var(--neutral-dark);
  font-size: var(--font-size-base);
}

.card {
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.card-header {
  padding: var(--spacing-md);
  background-color: var(--neutral-light);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--secondary-color);
}

.card-body {
  padding: var(--spacing-lg);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
}

.form-group {
  flex: 1;
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--secondary-color);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(216, 31, 38, 0.1);
}

.form-control:disabled {
  background-color: var(--neutral-light);
  cursor: not-allowed;
  opacity: 0.7;
}

.form-actions {
  margin-top: var(--spacing-md);
}

.security-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.security-item:last-child {
  border-bottom: none;
}

.security-label {
  font-weight: 500;
  color: var(--secondary-color);
}

.security-status {
  font-size: var(--font-size-sm);
  padding: 2px 8px;
  border-radius: 12px;
  background-color: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.security-status.active {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .security-item button {
    align-self: flex-end;
  }
  
  .profile-header-section {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-container {
    margin-right: 0;
    margin-bottom: var(--spacing-md);
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
}
</style>
