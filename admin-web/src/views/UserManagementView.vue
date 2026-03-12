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

    <!-- 用户列表 -->
    <div class="card">
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
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveUser">保存</button>
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

    <!-- 提示弹窗 -->
    <div class="toast" :class="toastType" v-if="toastVisible">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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

// 弹窗状态
const modalVisible = ref(false)
const deleteModalVisible = ref(false)
const isEditMode = ref(false)
const selectedUserId = ref('')

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

// 提示信息
const toastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('toast-info')

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
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
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
  } catch (error) {
    console.error('获取用户列表失败:', error)
    showToast('获取用户列表失败', 'toast-error')
  }
}

const searchUsers = () => {
  // 模拟搜索功能
  fetchUsers()
  
  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const filteredUsers = users.value.filter(user => 
      user.username.includes(searchKeyword.value) ||
      user.phone.includes(searchKeyword.value) ||
      user.name.includes(searchKeyword.value)
    )
    users.value = filteredUsers
    total.value = filteredUsers.length
  }
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

const saveUser = () => {
  if (!userForm.value.username || !userForm.value.name || !userForm.value.phone) {
    showToast('请填写必填字段', 'toast-error')
    return
  }
  
  if (!isEditMode.value && !userForm.value.password) {
    showToast('请输入密码', 'toast-error')
    return
  }
  
  // 模拟保存用户
  if (isEditMode.value) {
    // 编辑用户
    const index = users.value.findIndex(u => u.id === userForm.value.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        name: userForm.value.name,
        phone: userForm.value.phone,
        role: userForm.value.role,
        status: userForm.value.status
      }
      showToast('用户编辑成功', 'toast-success')
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
    showToast('用户添加成功', 'toast-success')
  }
  
  closeModal()
}

const openDeleteUserModal = (userId: string) => {
  selectedUserId.value = userId
  deleteModalVisible.value = true
}

const closeDeleteModal = () => {
  deleteModalVisible.value = false
  selectedUserId.value = ''
}

const confirmDelete = () => {
  if (selectedUserId.value) {
    users.value = users.value.filter(user => user.id !== selectedUserId.value)
    total.value = users.value.length
    showToast('用户删除成功', 'toast-success')
    closeDeleteModal()
  }
}

const showToast = (message: string, type: 'toast-success' | 'toast-error' | 'toast-info' = 'toast-info') => {
  toastMessage.value = message
  toastType.value = type
  toastVisible.value = true
  
  setTimeout(() => {
    toastVisible.value = false
  }, 3000)
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
</style>
