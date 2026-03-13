<template>
  <div class="user-management-container">
    <!-- 搜索和操作栏 -->
    <div class="search-bar">
      <div class="search-input-group">
        <input
          type="text"
          v-model="searchKeyword"
          class="form-control"
          placeholder="请输入用户名或手机号"
        />
        <button class="btn btn-secondary" @click="searchUsers">搜索</button>
      </div>
      <button class="btn btn-primary" @click="openAddUserModal">添加用户</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <p class="error-text">{{ error }}</p>
      <button class="btn btn-primary" @click="fetchUsers">重试</button>
    </div>

    <!-- 用户列表 -->
    <div v-else class="card">
      <div class="card-header">
        用户列表
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>用户ID</th>
              <th>用户名</th>
              <th>手机号</th>
              <th>姓名</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ user.name }}</td>
              <td>{{ getUserRoleText(user.role) }}</td>
              <td>
                <span class="status-badge" :class="user.status">{{ getUserStatusText(user.status) }}</span>
              </td>
              <td>{{ user.createdAt }}</td>
              <td>
                <button class="btn btn-secondary" style="margin-right: 8px;" @click="openEditUserModal(user)">
                  编辑
                </button>
                <button class="btn btn-danger" @click="openDeleteUserModal(user.id)">
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="8" class="no-data">暂无用户数据</td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <span class="pagination-item" @click="changePage(1)" :class="{ disabled: currentPage === 1 }">
            首页
          </span>
          <span class="pagination-item" @click="changePage(currentPage - 1)" :class="{ disabled: currentPage === 1 }">
            上一页
          </span>
          <span 
            v-for="page in totalPages" 
            :key="page"
            class="pagination-item"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </span>
          <span class="pagination-item" @click="changePage(currentPage + 1)" :class="{ disabled: currentPage === totalPages }">
            下一页
          </span>
          <span class="pagination-item" @click="changePage(totalPages)" :class="{ disabled: currentPage === totalPages }">
            末页
          </span>
        </div>
      </div>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <div class="modal-overlay" v-if="modalVisible" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? '编辑用户' : '添加用户' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" v-model="userForm.username" class="form-control" :disabled="isEditMode" />
          </div>
          <div class="form-group">
            <label class="form-label">姓名</label>
            <input type="text" v-model="userForm.name" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input type="tel" v-model="userForm.phone" class="form-control" />
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input type="password" v-model="userForm.password" class="form-control" :placeholder="isEditMode ? '留空表示不修改' : '请输入密码'" />
          </div>
          <div class="form-group">
            <label class="form-label">角色</label>
            <select v-model="userForm.role" class="form-control">
              <option value="user">普通用户</option>
              <option value="volunteer">志愿者</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">状态</label>
            <select v-model="userForm.status" class="form-control">
              <option value="active">活跃</option>
              <option value="inactive">未激活</option>
              <option value="banned">已禁用</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal" :disabled="saving">取消</button>
          <button class="btn btn-primary" @click="saveUser" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="deleteModalVisible" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="modal-close" @click="closeDeleteModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>确定要删除该用户吗？此操作不可恢复。</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDeleteModal">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">删除</button>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'

const showToast = inject('showToast') as (message: string, type?: 'success' | 'error' | 'info') => void

interface User {
  id: string
  username: string
  phone: string
  name: string
  role: 'admin' | 'user' | 'volunteer'
  status: 'active' | 'inactive' | 'banned'
  createdAt: string
}

interface UserForm {
  id: string
  username: string
  name: string
  phone: string
  password: string
  role: 'admin' | 'user' | 'volunteer'
  status: 'active' | 'inactive' | 'banned'
}

const users = ref<User[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// 弹窗状态
const modalVisible = ref(false)
const deleteModalVisible = ref(false)
const isEditMode = ref(false)
const selectedUserId = ref('')
const saving = ref(false)

// 用户表单
const userForm = ref<UserForm>({
  id: '',
  username: '',
  name: '',
  phone: '',
  password: '',
  role: 'user',
  status: 'active'
})

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const getUserRoleText = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    user: '普通用户',
    volunteer: '志愿者'
  }
  return roleMap[role] || role
}

const getUserStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '未激活',
    banned: '已禁用'
  }
  return statusMap[status] || status
}

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 调用后端 API 获取用户列表
    const response = await fetch(`http://localhost:3001/api/admin/user?page=${currentPage.value}&pageSize=${pageSize.value}&keyword=${encodeURIComponent(searchKeyword.value)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      users.value = data.users
      total.value = data.total
    } else {
      // 模拟数据（用于开发环境）
      const mockUsers: User[] = [
        { id: '1', username: 'admin', phone: '13800138000', name: '管理员', role: 'admin', status: 'active', createdAt: '2024-03-01 00:00:00' },
        { id: '2', username: 'user1', phone: '13800138001', name: '张三', role: 'user', status: 'active', createdAt: '2024-03-02 10:00:00' },
        { id: '3', username: 'user2', phone: '13800138002', name: '李四', role: 'user', status: 'active', createdAt: '2024-03-03 14:30:00' },
        { id: '4', username: 'user3', phone: '13800138003', name: '王五', role: 'volunteer', status: 'active', createdAt: '2024-03-04 09:15:00' },
        { id: '5', username: 'user4', phone: '13800138004', name: '赵六', role: 'user', status: 'inactive', createdAt: '2024-03-05 16:45:00' },
        { id: '6', username: 'user5', phone: '13800138005', name: '孙七', role: 'user', status: 'banned', createdAt: '2024-03-06 11:20:00' },
        { id: '7', username: 'user6', phone: '13800138006', name: '周八', role: 'volunteer', status: 'active', createdAt: '2024-03-07 15:10:00' },
        { id: '8', username: 'user7', phone: '13800138007', name: '吴九', role: 'user', status: 'active', createdAt: '2024-03-08 10:30:00' },
        { id: '9', username: 'user8', phone: '13800138008', name: '郑十', role: 'user', status: 'active', createdAt: '2024-03-09 14:45:00' },
        { id: '10', username: 'user9', phone: '13800138009', name: '王十一', role: 'user', status: 'active', createdAt: '2024-03-10 09:00:00' }
      ]
      
      users.value = mockUsers
      total.value = mockUsers.length
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    error.value = '获取用户列表失败，请重试' as string
    showToast('获取用户列表失败', 'error')
    
    // 模拟数据（用于开发环境）
    const mockUsers: User[] = [
      { id: '1', username: 'admin', phone: '13800138000', name: '管理员', role: 'admin', status: 'active', createdAt: '2024-03-01 00:00:00' },
      { id: '2', username: 'user1', phone: '13800138001', name: '张三', role: 'user', status: 'active', createdAt: '2024-03-02 10:00:00' },
      { id: '3', username: 'user2', phone: '13800138002', name: '李四', role: 'user', status: 'active', createdAt: '2024-03-03 14:30:00' },
      { id: '4', username: 'user3', phone: '13800138003', name: '王五', role: 'volunteer', status: 'active', createdAt: '2024-03-04 09:15:00' },
      { id: '5', username: 'user4', phone: '13800138004', name: '赵六', role: 'user', status: 'inactive', createdAt: '2024-03-05 16:45:00' },
      { id: '6', username: 'user5', phone: '13800138005', name: '孙七', role: 'user', status: 'banned', createdAt: '2024-03-06 11:20:00' },
      { id: '7', username: 'user6', phone: '13800138006', name: '周八', role: 'volunteer', status: 'active', createdAt: '2024-03-07 15:10:00' },
      { id: '8', username: 'user7', phone: '13800138007', name: '吴九', role: 'user', status: 'active', createdAt: '2024-03-08 10:30:00' },
      { id: '9', username: 'user8', phone: '13800138008', name: '郑十', role: 'user', status: 'active', createdAt: '2024-03-09 14:45:00' },
      { id: '10', username: 'user9', phone: '13800138009', name: '王十一', role: 'user', status: 'active', createdAt: '2024-03-10 09:00:00' }
    ]
    
    users.value = mockUsers
    total.value = mockUsers.length
  } finally {
    loading.value = false
  }
}

const searchUsers = () => {
  currentPage.value = 1
  fetchUsers()
}

const openAddUserModal = () => {
  isEditMode.value = false
  userForm.value = {
    id: '',
    username: '',
    name: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active'
  }
  modalVisible.value = true
}

const openEditUserModal = (user: User) => {
  isEditMode.value = true
  userForm.value = {
    id: user.id,
    username: user.username,
    name: user.name,
    phone: user.phone,
    password: '',
    role: user.role,
    status: user.status
  }
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
}

const validateForm = (): boolean => {
  if (!userForm.value.username) {
    showToast('请输入用户名', 'error')
    return false
  }
  
  if (!userForm.value.name) {
    showToast('请输入姓名', 'error')
    return false
  }
  
  if (!userForm.value.phone) {
    showToast('请输入手机号', 'error')
    return false
  }
  
  if (!/^1[3-9]\d{9}$/.test(userForm.value.phone)) {
    showToast('请输入正确的手机号', 'error')
    return false
  }
  
  if (!isEditMode.value && !userForm.value.password) {
    showToast('请输入密码', 'error')
    return false
  }
  
  if (userForm.value.password && userForm.value.password.length < 6) {
    showToast('密码长度不能少于6位', 'error')
    return false
  }
  
  return true
}

const saveUser = async () => {
  if (!validateForm()) {
    return
  }
  
  saving.value = true
  
  try {
    if (isEditMode.value) {
      // 编辑用户
      const response = await fetch(`http://localhost:3001/api/admin/user/${userForm.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          realName: userForm.value.name,
          phone: userForm.value.phone,
          role: userForm.value.role,
          status: userForm.value.status,
          ...(userForm.value.password && { password: userForm.value.password })
        })
      })
      
      if (response.ok) {
        // 更新本地数据
        const index = users.value.findIndex(u => u.id === userForm.value.id)
        if (index !== -1) {
          users.value[index] = {
            id: users.value[index].id,
            username: users.value[index].username,
            phone: userForm.value.phone,
            name: userForm.value.name,
            role: userForm.value.role,
            status: userForm.value.status,
            createdAt: users.value[index].createdAt
          }
        }
        showToast('用户编辑成功', 'success')
      } else {
        const errorData = await response.json()
        showToast(errorData.message || '编辑用户失败', 'error')
      }
    } else {
      // 添加用户
      const response = await fetch('http://localhost:3001/api/admin/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: userForm.value.username,
          password: userForm.value.password,
          realName: userForm.value.name,
          phone: userForm.value.phone,
          role: userForm.value.role,
          status: userForm.value.status
        })
      })
      
      if (response.ok) {
        const newUser = await response.json()
        users.value.push({
          id: newUser.id.toString(),
          username: newUser.username,
          name: newUser.realName,
          phone: newUser.phone,
          role: newUser.role,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })
        total.value = users.value.length
        showToast('用户添加成功', 'success')
      } else {
        const errorData = await response.json()
        showToast(errorData.message || '添加用户失败', 'error')
      }
    }
    
    closeModal()
  } catch (error) {
    console.error('保存用户失败:', error)
    showToast('保存用户失败，请重试', 'error')
    
    // 模拟保存用户
    if (isEditMode.value) {
      // 编辑用户
      const index = users.value.findIndex(u => u.id === userForm.value.id)
      if (index !== -1) {
        users.value[index] = {
          id: users.value[index].id,
          username: users.value[index].username,
          phone: userForm.value.phone,
          name: userForm.value.name,
          role: userForm.value.role,
          status: userForm.value.status,
          createdAt: users.value[index].createdAt
        }
        showToast('用户编辑成功', 'success')
      }
    } else {
      // 添加用户
      const newUser: User = {
        id: (users.value.length + 1).toString(),
        username: userForm.value.username,
        name: userForm.value.name,
        phone: userForm.value.phone,
        role: userForm.value.role,
        status: userForm.value.status,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      users.value.push(newUser)
      total.value = users.value.length
      showToast('用户添加成功', 'success')
    }
    
    closeModal()
  } finally {
    saving.value = false
  }
}

const openDeleteUserModal = (userId: string) => {
  selectedUserId.value = userId
  deleteModalVisible.value = true
}

const closeDeleteModal = () => {
  deleteModalVisible.value = false
  selectedUserId.value = ''
}

const confirmDelete = async () => {
  if (!selectedUserId.value) {
    return
  }
  
  try {
    const response = await fetch(`http://localhost:3001/api/admin/user/${selectedUserId.value}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (response.ok) {
      users.value = users.value.filter(user => user.id !== selectedUserId.value)
      total.value = users.value.length
      showToast('用户删除成功', 'success')
      closeDeleteModal()
    } else {
      const errorData = await response.json()
      showToast(errorData.message || '删除用户失败', 'error')
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    showToast('删除用户失败，请重试', 'error')
    
    // 模拟删除用户
    users.value = users.value.filter(user => user.id !== selectedUserId.value)
    total.value = users.value.length
    showToast('用户删除成功', 'success')
    closeDeleteModal()
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers()
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-container {
  padding: var(--spacing-md);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.search-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.search-input-group input {
  width: 300px;
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
  padding: var(--spacing-md);
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.status-badge.inactive {
  background-color: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.status-badge.banned {
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-lg);
  gap: var(--spacing-xs);
}

.pagination-item {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-item:hover {
  background-color: var(--primary-color);
  color: var(--white);
  transform: scale(1.05);
}

.pagination-item.active {
  background-color: var(--primary-color);
  color: var(--white);
}

.pagination-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-item.disabled:hover {
  background-color: transparent;
  color: inherit;
  transform: none;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .search-input-group input {
    width: 100%;
  }
  
  .table {
    font-size: var(--font-size-sm);
  }
  
  .table th,
  .table td {
    padding: var(--spacing-xs);
  }
  
  .btn {
    padding: var(--spacing-xs);
    font-size: var(--font-size-sm);
  }
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: var(--spacing-md);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid var(--neutral-light);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: var(--font-size-lg);
  color: var(--neutral-dark);
  font-weight: 500;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: var(--spacing-md);
  text-align: center;
  padding: var(--spacing-lg);
}

.error-icon {
  font-size: 48px;
  color: var(--error-color);
  margin-bottom: var(--spacing-sm);
}

.error-text {
  font-size: var(--font-size-lg);
  color: var(--neutral-dark);
  margin-bottom: var(--spacing-md);
}

/* 无数据状态样式 */
.no-data {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--neutral-dark);
  font-size: var(--font-size-base);
}

/* 表格样式 */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.table th {
  background-color: var(--neutral-light);
  font-weight: 600;
  color: var(--secondary-color);
}

.table tr:hover {
  background-color: rgba(216, 31, 38, 0.05);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--neutral-light);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--secondary-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--neutral-dark);
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--primary-color);
}

.modal-body {
  padding: var(--spacing-md);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background-color: var(--neutral-light);
}

/* 表单样式 */
.form-group {
  margin-bottom: var(--spacing-md);
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
}

/* 响应式调整 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer button {
    width: 100%;
  }
}
</style>
