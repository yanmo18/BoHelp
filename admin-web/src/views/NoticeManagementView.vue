<template>
  <div class="notice-management-container">
    <!-- 搜索和操作栏 -->
    <div class="search-bar">
      <div class="search-input-group">
        <input
          type="text"
          v-model="searchKeyword"
          class="form-control"
          placeholder="请输入公告标题"
        />
        <button class="btn btn-secondary" @click="searchNotices">搜索</button>
      </div>
      <button class="btn btn-primary" @click="openAddNoticeModal">添加公告</button>
    </div>

    <!-- 公告列表 -->
    <div class="card">
      <div class="card-header">
        公告列表
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>公告ID</th>
              <th>标题</th>
              <th>内容</th>
              <th>发布人</th>
              <th>发布时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="notice in notices" :key="notice.id">
              <td>{{ notice.id }}</td>
              <td>{{ notice.title }}</td>
              <td>{{ notice.content }}</td>
              <td>{{ notice.author }}</td>
              <td>{{ notice.createdAt }}</td>
              <td>
                <span class="status-badge" :class="notice.status">{{ getStatusText(notice.status) }}</span>
              </td>
              <td>
                <button class="btn btn-secondary" style="margin-right: 8px;" @click="openEditNoticeModal(notice)">
                  编辑
                </button>
                <button class="btn btn-danger" @click="openDeleteNoticeModal(notice.id)">
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

    <!-- 添加/编辑公告弹窗 -->
    <div class="modal-overlay" v-if="modalVisible" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? '编辑公告' : '添加公告' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">标题</label>
            <input type="text" v-model="noticeForm.title" class="form-control" placeholder="请输入公告标题" />
          </div>
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea v-model="noticeForm.content" class="form-control" rows="4" placeholder="请输入公告内容"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">状态</label>
            <select v-model="noticeForm.status" class="form-control">
              <option value="active">已发布</option>
              <option value="inactive">未发布</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveNotice">保存</button>
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
          <p>确定要删除该公告吗？此操作不可恢复。</p>
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

interface Notice {
  id: string
  title: string
  content: string
  author: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface NoticeForm {
  id: string
  title: string
  content: string
  status: 'active' | 'inactive'
}

const notices = ref<Notice[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 弹窗状态
const modalVisible = ref(false)
const deleteModalVisible = ref(false)
const isEditMode = ref(false)
const selectedNoticeId = ref('')

// 公告表单
const noticeForm = ref<NoticeForm>({
  id: '',
  title: '',
  content: '',
  status: 'active'
})

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '已发布',
    inactive: '未发布'
  }
  return statusMap[status] || status
}

const fetchNotices = async () => {
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockNotices: Notice[] = [
      { id: 'N10001', title: '系统更新通知', content: '博城帮系统将于本周日进行更新维护，届时系统将暂时无法使用。', author: '管理员', status: 'active', createdAt: '2024-03-12 10:30:00' },
      { id: 'N10002', title: '新功能上线', content: '新增代拿订单功能，用户可以发布代拿需求。', author: '管理员', status: 'active', createdAt: '2024-03-11 09:15:00' },
      { id: 'N10003', title: '用户指南', content: '博城帮使用指南已更新，请查看帮助中心。', author: '管理员', status: 'active', createdAt: '2024-03-10 08:45:00' },
      { id: 'N10004', title: '活动通知', content: '三月社区活动开始报名，详情请查看活动页面。', author: '管理员', status: 'active', createdAt: '2024-03-09 18:30:00' },
      { id: 'N10005', title: '系统公告', content: '系统将于下周进行安全升级，请用户提前做好准备。', author: '管理员', status: 'inactive', createdAt: '2024-03-08 16:20:00' },
      { id: 'N10006', title: '用户福利', content: '新用户注册即可获得50积分奖励。', author: '管理员', status: 'active', createdAt: '2024-03-07 12:15:00' },
      { id: 'N10007', title: '服务调整', content: '外卖订单配送时间调整为30-45分钟。', author: '管理员', status: 'active', createdAt: '2024-03-06 11:30:00' },
      { id: 'N10008', title: '系统维护', content: '系统将于本周五进行例行维护，预计维护时间2小时。', author: '管理员', status: 'inactive', createdAt: '2024-03-05 10:45:00' },
      { id: 'N10009', title: '社区公告', content: '社区志愿者招募开始，有意者请联系管理员。', author: '管理员', status: 'active', createdAt: '2024-03-04 19:30:00' },
      { id: 'N10010', title: '功能优化', content: '优化了订单提交流程，提高了系统响应速度。', author: '管理员', status: 'active', createdAt: '2024-03-03 17:20:00' }
    ]
    
    notices.value = mockNotices
    total.value = mockNotices.length
  } catch (error) {
    console.error('获取公告列表失败:', error)
    showToast('获取公告列表失败', 'toast-error')
  }
}

const searchNotices = () => {
  // 模拟搜索功能
  fetchNotices()
  
  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const filteredNotices = notices.value.filter(notice => 
      notice.title.includes(searchKeyword.value) ||
      notice.content.includes(searchKeyword.value)
    )
    notices.value = filteredNotices
    total.value = filteredNotices.length
  }
}

const openAddNoticeModal = () => {
  isEditMode.value = false
  noticeForm.value = {
    id: '',
    title: '',
    content: '',
    status: 'active'
  }
  modalVisible.value = true
}

const openEditNoticeModal = (notice: Notice) => {
  isEditMode.value = true
  noticeForm.value = {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    status: notice.status
  }
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
}

const saveNotice = () => {
  if (!noticeForm.value.title || !noticeForm.value.content) {
    showToast('请填写标题和内容', 'error')
    return
  }
  
  if (isEditMode.value) {
    // 编辑公告
    const index = notices.value.findIndex(n => n.id === noticeForm.value.id)
    if (index !== -1) {
      notices.value[index] = {
        ...notices.value[index],
        title: noticeForm.value.title,
        content: noticeForm.value.content,
        status: noticeForm.value.status
      }
      showToast('公告编辑成功', 'success')
    }
  } else {
    // 添加公告
    const newNotice: Notice = {
      id: `N${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      title: noticeForm.value.title,
      content: noticeForm.value.content,
      author: '管理员',
      status: noticeForm.value.status,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    notices.value.push(newNotice)
    total.value = notices.value.length
    showToast('公告添加成功', 'success')
  }
  
  closeModal()
}

const openDeleteNoticeModal = (noticeId: string) => {
  selectedNoticeId.value = noticeId
  deleteModalVisible.value = true
}

const closeDeleteModal = () => {
  deleteModalVisible.value = false
  selectedNoticeId.value = ''
}

const confirmDelete = () => {
  if (selectedNoticeId.value) {
    notices.value = notices.value.filter(notice => notice.id !== selectedNoticeId.value)
    total.value = notices.value.length
    showToast('公告删除成功', 'success')
    closeDeleteModal()
  }
}



const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchNotices()
  }
}

onMounted(() => {
  fetchNotices()
})
</script>

<style scoped>
.notice-management-container {
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

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
  color: var(--secondary-color);
}

.form-control {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-md);
  transition: border-color var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(216, 31, 38, 0.1);
}

.form-control textarea {
  resize: vertical;
  min-height: 100px;
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
  
  .form-control {
    font-size: var(--font-size-sm);
  }
}
</style>
