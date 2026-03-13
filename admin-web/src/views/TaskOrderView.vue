<template>
  <div class="task-order-container">
    <!-- 搜索和操作栏 -->
    <div class="search-bar">
      <div class="search-input-group">
        <input
          type="text"
          v-model="searchKeyword"
          class="form-control"
          placeholder="请输入订单ID或用户手机号"
        />
        <button class="btn btn-secondary" @click="searchOrders">搜索</button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="card">
      <div class="card-header">
        悬赏订单列表
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>订单ID</th>
              <th>用户</th>
              <th>手机号</th>
              <th>任务标题</th>
              <th>任务描述</th>
              <th>金额</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.userName }}</td>
              <td>{{ order.phone }}</td>
              <td>{{ order.title }}</td>
              <td>{{ order.description }}</td>
              <td>¥{{ order.amount }}</td>
              <td>
                <span class="status-badge" :class="order.status">{{ getStatusText(order.status) }}</span>
              </td>
              <td>{{ order.createdAt }}</td>
              <td>
                <button class="btn btn-secondary" style="margin-right: 8px;" @click="viewOrder(order)">
                  查看
                </button>
                <button class="btn btn-danger" @click="openDeleteOrderModal(order.id)">
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

    <!-- 订单详情弹窗 -->
    <div class="modal-overlay" v-if="detailModalVisible" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button class="modal-close" @click="closeDetailModal">&times;</button>
        </div>
        <div class="modal-body" v-if="selectedOrder">
          <div class="order-detail-item">
            <span class="label">订单ID:</span>
            <span class="value">{{ selectedOrder.id }}</span>
          </div>
          <div class="order-detail-item">
            <span class="label">用户:</span>
            <span class="value">{{ selectedOrder.userName }}</span>
          </div>
          <div class="order-detail-item">
            <span class="label">手机号:</span>
            <span class="value">{{ selectedOrder.phone }}</span>
          </div>
          <div class="order-detail-item">
            <span class="label">任务标题:</span>
            <span class="value">{{ selectedOrder.title }}</span>
          </div>
          <div class="order-detail-item">
            <span class="label">任务描述:</span>
            <span class="value">{{ selectedOrder.description }}</span>
          </div>
          <div class="order-detail-item">
            <span class="label">金额:</span>
            <span class="value">¥{{ selectedOrder.amount }}</span>
          </div>
          <div class="order-detail-item">
            <span class="label">状态:</span>
            <span class="value">{{ getStatusText(selectedOrder.status) }}</span>
          </div>
          <div class="order-detail-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ selectedOrder.createdAt }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDetailModal">关闭</button>
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
          <p>确定要删除该订单吗？此操作不可恢复。</p>
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

interface TaskOrder {
  id: string
  taskName: string
  description: string
  reward: number
  publisher: string
  publisherPhone: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
}

const orders = ref<TaskOrder[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 弹窗状态
const detailModalVisible = ref(false)
const deleteModalVisible = ref(false)
const selectedOrder = ref<TaskOrder | null>(null)
const selectedOrderId = ref('')

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待接单',
    processing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const fetchOrders = async () => {
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockOrders: TaskOrder[] = [
      { id: 'X10001', userName: '张三', phone: '13800138001', title: '寻找丢失的宠物狗', description: '棕色泰迪，脖子上有红色项圈', amount: 50.0, status: 'completed', createdAt: '2024-03-12 10:30:00' },
      { id: 'X10002', userName: '李四', phone: '13800138002', title: '帮忙搬家', description: '从旧公寓搬到新公寓，有家具', amount: 100.0, status: 'processing', createdAt: '2024-03-12 09:15:00' },
      { id: 'X10003', userName: '王五', phone: '13800138003', title: '辅导功课', description: '小学数学辅导，每周三次', amount: 80.0, status: 'pending', createdAt: '2024-03-12 08:45:00' },
      { id: 'X10004', userName: '赵六', phone: '13800138004', title: '花园整理', description: '修剪草坪，清理花园', amount: 60.0, status: 'completed', createdAt: '2024-03-11 18:30:00' },
      { id: 'X10005', userName: '孙七', phone: '13800138005', title: '接送孩子', description: '每天下午接孩子放学', amount: 120.0, status: 'cancelled', createdAt: '2024-03-11 16:20:00' },
      { id: 'X10006', userName: '周八', phone: '13800138006', title: '寻找丢失的钥匙', description: '小区内丢失的钥匙串', amount: 30.0, status: 'completed', createdAt: '2024-03-11 12:15:00' },
      { id: 'X10007', userName: '吴九', phone: '13800138007', title: '帮忙搬家', description: '小件物品搬家，无家具', amount: 50.0, status: 'processing', createdAt: '2024-03-11 11:30:00' },
      { id: 'X10008', userName: '郑十', phone: '13800138008', title: '辅导功课', description: '初中英语辅导，每周两次', amount: 100.0, status: 'pending', createdAt: '2024-03-11 10:45:00' },
      { id: 'X10009', userName: '王十一', phone: '13800138009', title: '花园整理', description: '种植花卉，清理杂草', amount: 70.0, status: 'completed', createdAt: '2024-03-10 19:30:00' },
      { id: 'X10010', userName: '赵十二', phone: '13800138010', title: '接送孩子', description: '每周一、三、五接孩子', amount: 90.0, status: 'completed', createdAt: '2024-03-10 17:20:00' }
    ]
    
    orders.value = mockOrders
    total.value = mockOrders.length
  } catch (error) {
    console.error('获取悬赏订单失败:', error)
    showToast('获取悬赏订单失败', 'toast-error')
  }
}

const searchOrders = () => {
  // 模拟搜索功能
  fetchOrders()
  
  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const filteredOrders = orders.value.filter(order => 
      order.id.includes(searchKeyword.value) ||
      order.phone.includes(searchKeyword.value) ||
      order.userName.includes(searchKeyword.value) ||
      order.title.includes(searchKeyword.value)
    )
    orders.value = filteredOrders
    total.value = filteredOrders.length
  }
}

const viewOrder = (order: TaskOrder) => {
  selectedOrder.value = order
  detailModalVisible.value = true
}

const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedOrder.value = null
}

const openDeleteOrderModal = (orderId: string) => {
  selectedOrderId.value = orderId
  deleteModalVisible.value = true
}

const closeDeleteModal = () => {
  deleteModalVisible.value = false
  selectedOrderId.value = ''
}

const confirmDelete = () => {
  if (selectedOrderId.value) {
    orders.value = orders.value.filter(order => order.id !== selectedOrderId.value)
    total.value = orders.value.length
    showToast('订单删除成功', 'success')
    closeDeleteModal()
  }
}



const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchOrders()
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.task-order-container {
  padding: var(--spacing-md);
}

.search-bar {
  display: flex;
  justify-content: flex-start;
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

.status-badge.pending {
  background-color: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.status-badge.processing {
  background-color: rgba(33, 150, 243, 0.1);
  color: var(--info-color);
}

.status-badge.completed {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.status-badge.cancelled {
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

.order-detail-item {
  display: flex;
  margin-bottom: var(--spacing-sm);
}

.order-detail-item .label {
  width: 80px;
  font-weight: 600;
  color: var(--secondary-color);
}

.order-detail-item .value {
  flex: 1;
  color: var(--text-color);
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
  
  .order-detail-item {
    flex-direction: column;
  }
  
  .order-detail-item .label {
    width: 100%;
    margin-bottom: 4px;
  }
}
</style>
