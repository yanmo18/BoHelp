<template>
  <div class="village-management-container">
    <!-- 搜索和操作栏 -->
    <div class="search-bar">
      <div class="search-input-group">
        <input
          type="text"
          v-model="searchKeyword"
          class="form-control"
          placeholder="请输入村庄名称"
        />
        <button class="btn btn-secondary" @click="searchVillages">搜索</button>
      </div>
      <button class="btn btn-primary" @click="openAddVillageModal">添加村庄</button>
    </div>

    <!-- 村庄列表 -->
    <div class="card">
      <div class="card-header">
        村庄列表
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>村庄ID</th>
              <th>村庄名称</th>
              <th>村庄代码</th>
              <th>负责人</th>
              <th>联系电话</th>
              <th>地址</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="village in villages" :key="village.id">
              <td>{{ village.id }}</td>
              <td>{{ village.name }}</td>
              <td>{{ village.code }}</td>
              <td>{{ village.manager }}</td>
              <td>{{ village.phone }}</td>
              <td>{{ village.address }}</td>
              <td>
                <span class="status-badge" :class="village.status">{{ getStatusText(village.status) }}</span>
              </td>
              <td>{{ village.createdAt }}</td>
              <td>
                <button class="btn btn-secondary" style="margin-right: 8px;" @click="openEditVillageModal(village)">
                  编辑
                </button>
                <button class="btn btn-danger" @click="openDeleteVillageModal(village.id)">
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

    <!-- 添加/编辑村庄弹窗 -->
    <div class="modal-overlay" v-if="modalVisible" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditMode ? '编辑村庄' : '添加村庄' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">村庄名称</label>
            <input type="text" v-model="villageForm.name" class="form-control" placeholder="请输入村庄名称" />
          </div>
          <div class="form-group">
            <label class="form-label">村庄代码</label>
            <input type="text" v-model="villageForm.code" class="form-control" :disabled="isEditMode" placeholder="请输入村庄代码" />
          </div>
          <div class="form-group">
            <label class="form-label">负责人</label>
            <input type="text" v-model="villageForm.manager" class="form-control" placeholder="请输入负责人姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input type="tel" v-model="villageForm.phone" class="form-control" placeholder="请输入联系电话" />
          </div>
          <div class="form-group">
            <label class="form-label">地址</label>
            <input type="text" v-model="villageForm.address" class="form-control" placeholder="请输入村庄地址" />
          </div>
          <div class="form-group">
            <label class="form-label">状态</label>
            <select v-model="villageForm.status" class="form-control">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveVillage">保存</button>
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
          <p>确定要删除该村庄吗？此操作不可恢复。</p>
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

interface Village {
  id: string
  name: string
  code: string
  manager: string
  phone: string
  address: string
  status: 'active' | 'inactive'
  createdAt: string
}

interface VillageForm {
  id: string
  name: string
  code: string
  manager: string
  phone: string
  address: string
  status: 'active' | 'inactive'
}

const villages = ref<Village[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 弹窗状态
const modalVisible = ref(false)
const deleteModalVisible = ref(false)
const isEditMode = ref(false)
const selectedVillageId = ref('')

// 村庄表单
const villageForm = ref<VillageForm>({
  id: '',
  name: '',
  code: '',
  manager: '',
  phone: '',
  address: '',
  status: 'active'
})

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用'
  }
  return statusMap[status] || status
}

const fetchVillages = async () => {
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    const mockVillages: Village[] = [
      { id: 'V10001', name: '博城村', code: 'BC001', manager: '张三', phone: '13800138001', address: '博城路1号', status: 'active', createdAt: '2024-03-12 10:30:00' },
      { id: 'V10002', name: '幸福村', code: 'XF001', manager: '李四', phone: '13800138002', address: '幸福路2号', status: 'active', createdAt: '2024-03-11 09:15:00' },
      { id: 'V10003', name: '和谐村', code: 'HX001', manager: '王五', phone: '13800138003', address: '和谐路3号', status: 'active', createdAt: '2024-03-10 08:45:00' },
      { id: 'V10004', name: '平安村', code: 'PA001', manager: '赵六', phone: '13800138004', address: '平安路4号', status: 'inactive', createdAt: '2024-03-09 18:30:00' },
      { id: 'V10005', name: '光明村', code: 'GM001', manager: '孙七', phone: '13800138005', address: '光明路5号', status: 'active', createdAt: '2024-03-08 16:20:00' },
      { id: 'V10006', name: '富裕村', code: 'FY001', manager: '周八', phone: '13800138006', address: '富裕路6号', status: 'active', createdAt: '2024-03-07 12:15:00' },
      { id: 'V10007', name: '文明村', code: 'WM001', manager: '吴九', phone: '13800138007', address: '文明路7号', status: 'active', createdAt: '2024-03-06 11:30:00' },
      { id: 'V10008', name: '团结村', code: 'TJ001', manager: '郑十', phone: '13800138008', address: '团结路8号', status: 'inactive', createdAt: '2024-03-05 10:45:00' },
      { id: 'V10009', name: '美丽村', code: 'ML001', manager: '王十一', phone: '13800138009', address: '美丽路9号', status: 'active', createdAt: '2024-03-04 19:30:00' },
      { id: 'V10010', name: '健康村', code: 'JK001', manager: '赵十二', phone: '13800138010', address: '健康路10号', status: 'active', createdAt: '2024-03-03 17:20:00' }
    ]
    
    villages.value = mockVillages
    total.value = mockVillages.length
  } catch (error) {
    console.error('获取村庄列表失败:', error)
    showToast('获取村庄列表失败', 'toast-error')
  }
}

const searchVillages = () => {
  // 模拟搜索功能
  fetchVillages()
  
  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const filteredVillages = villages.value.filter(village => 
      village.name.includes(searchKeyword.value) ||
      village.code.includes(searchKeyword.value) ||
      village.manager.includes(searchKeyword.value) ||
      village.phone.includes(searchKeyword.value)
    )
    villages.value = filteredVillages
    total.value = filteredVillages.length
  }
}

const openAddVillageModal = () => {
  isEditMode.value = false
  villageForm.value = {
    id: '',
    name: '',
    code: '',
    manager: '',
    phone: '',
    address: '',
    status: 'active'
  }
  modalVisible.value = true
}

const openEditVillageModal = (village: Village) => {
  isEditMode.value = true
  villageForm.value = {
    id: village.id,
    name: village.name,
    code: village.code,
    manager: village.manager,
    phone: village.phone,
    address: village.address,
    status: village.status
  }
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
}

const saveVillage = () => {
  if (!villageForm.value.name || !villageForm.value.code || !villageForm.value.manager || !villageForm.value.phone || !villageForm.value.address) {
    showToast('请填写所有必填字段', 'error')
    return
  }
  
  if (isEditMode.value) {
    // 编辑村庄
    const index = villages.value.findIndex(v => v.id === villageForm.value.id)
    if (index !== -1) {
      villages.value[index] = {
        ...villages.value[index],
        name: villageForm.value.name,
        manager: villageForm.value.manager,
        phone: villageForm.value.phone,
        address: villageForm.value.address,
        status: villageForm.value.status
      }
      showToast('村庄编辑成功', 'success')
    }
  } else {
    // 添加村庄
    const newVillage: Village = {
      id: `V${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      name: villageForm.value.name,
      code: villageForm.value.code,
      manager: villageForm.value.manager,
      phone: villageForm.value.phone,
      address: villageForm.value.address,
      status: villageForm.value.status,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    villages.value.push(newVillage)
    total.value = villages.value.length
    showToast('村庄添加成功', 'success')
  }
  
  closeModal()
}

const openDeleteVillageModal = (villageId: string) => {
  selectedVillageId.value = villageId
  deleteModalVisible.value = true
}

const closeDeleteModal = () => {
  deleteModalVisible.value = false
  selectedVillageId.value = ''
}

const confirmDelete = () => {
  if (selectedVillageId.value) {
    villages.value = villages.value.filter(village => village.id !== selectedVillageId.value)
    total.value = villages.value.length
    showToast('村庄删除成功', 'success')
    closeDeleteModal()
  }
}



const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchVillages()
  }
}

onMounted(() => {
  fetchVillages()
})
</script>

<style scoped>
.village-management-container {
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

.form-control:disabled {
  background-color: var(--neutral-light);
  cursor: not-allowed;
  opacity: 0.7;
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
