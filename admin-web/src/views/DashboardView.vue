<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon user-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>用户总数</h3>
          <p class="stat-number">{{ stats.totalUsers }}</p>
          <p class="stat-trend" :class="{ positive: stats.userTrend > 0, negative: stats.userTrend < 0 }">
            {{ stats.userTrend > 0 ? '+' : '' }}{{ stats.userTrend }}% 较上月
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon takeaway-icon">
          <i class="fas fa-utensils"></i>
        </div>
        <div class="stat-content">
          <h3>外卖订单</h3>
          <p class="stat-number">{{ stats.totalTakeawayOrders }}</p>
          <p class="stat-trend" :class="{ positive: stats.takeawayTrend > 0, negative: stats.takeawayTrend < 0 }">
            {{ stats.takeawayTrend > 0 ? '+' : '' }}{{ stats.takeawayTrend }}% 较上月
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon takeit-icon">
          <i class="fas fa-box"></i>
        </div>
        <div class="stat-content">
          <h3>代拿订单</h3>
          <p class="stat-number">{{ stats.totalTakeitOrders }}</p>
          <p class="stat-trend" :class="{ positive: stats.takeitTrend > 0, negative: stats.takeitTrend < 0 }">
            {{ stats.takeitTrend > 0 ? '+' : '' }}{{ stats.takeitTrend }}% 较上月
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon task-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="stat-content">
          <h3>悬赏任务</h3>
          <p class="stat-number">{{ stats.totalTaskOrders }}</p>
          <p class="stat-trend" :class="{ positive: stats.taskTrend > 0, negative: stats.taskTrend < 0 }">
            {{ stats.taskTrend > 0 ? '+' : '' }}{{ stats.taskTrend }}% 较上月
          </p>
        </div>
      </div>
    </div>

    <!-- 订单变化图表 -->
    <div class="card">
      <div class="card-header">
        订单变化趋势
      </div>
      <div class="card-body">
        <div ref="chartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="card">
      <div class="card-header">
        最近订单
      </div>
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>订单ID</th>
              <th>类型</th>
              <th>用户</th>
              <th>金额</th>
              <th>状态</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ getOrderTypeText(order.type) }}</td>
              <td>{{ order.user }}</td>
              <td>¥{{ order.amount }}</td>
              <td>
                <span class="status-badge" :class="order.status">{{ getStatusText(order.status) }}</span>
              </td>
              <td>{{ order.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

interface Stats {
  totalUsers: number
  userTrend: number
  totalTakeawayOrders: number
  takeawayTrend: number
  totalTakeitOrders: number
  takeitTrend: number
  totalTaskOrders: number
  taskTrend: number
}

interface Order {
  id: string
  type: 'takeaway' | 'takeit' | 'task'
  user: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
}

const stats = ref<Stats>({
  totalUsers: 0,
  userTrend: 0,
  totalTakeawayOrders: 0,
  takeawayTrend: 0,
  totalTakeitOrders: 0,
  takeitTrend: 0,
  totalTaskOrders: 0,
  taskTrend: 0
})

const recentOrders = ref<Order[]>([])
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const getOrderTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    takeaway: '外卖',
    takeit: '代拿',
    task: '悬赏'
  }
  return typeMap[type] || type
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const fetchStats = async () => {
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    stats.value = {
      totalUsers: 1250,
      userTrend: 15.2,
      totalTakeawayOrders: 890,
      takeawayTrend: 8.7,
      totalTakeitOrders: 456,
      takeitTrend: 23.4,
      totalTaskOrders: 234,
      taskTrend: 12.8
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRecentOrders = async () => {
  try {
    // 模拟 API 请求
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    recentOrders.value = [
      { id: '10001', type: 'takeaway', user: '张三', amount: 35.5, status: 'completed', createdAt: '2024-03-12 10:30:00' },
      { id: '10002', type: 'takeit', user: '李四', amount: 10.0, status: 'processing', createdAt: '2024-03-12 09:15:00' },
      { id: '10003', type: 'task', user: '王五', amount: 50.0, status: 'pending', createdAt: '2024-03-12 08:45:00' },
      { id: '10004', type: 'takeaway', user: '赵六', amount: 28.0, status: 'completed', createdAt: '2024-03-11 18:30:00' },
      { id: '10005', type: 'takeit', user: '孙七', amount: 15.0, status: 'cancelled', createdAt: '2024-03-11 16:20:00' }
    ]
  } catch (error) {
    console.error('获取最近订单失败:', error)
  }
}

const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E0E0E0',
      borderWidth: 1,
      textStyle: {
        color: '#000000'
      }
    },
    legend: {
      data: ['外卖订单', '代拿订单', '悬赏任务'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '60px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '外卖订单',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: {
          color: '#D81F26'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(216, 31, 38, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(216, 31, 38, 0.05)'
              }
            ]
          }
        }
      },
      {
        name: '代拿订单',
        type: 'line',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310],
        itemStyle: {
          color: '#4CAF50'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(76, 175, 80, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(76, 175, 80, 0.05)'
              }
            ]
          }
        }
      },
      {
        name: '悬赏任务',
        type: 'line',
        smooth: true,
        data: [150, 232, 201, 154, 190, 330, 410],
        itemStyle: {
          color: '#2196F3'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(33, 150, 243, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(33, 150, 243, 0.05)'
              }
            ]
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentOrders()
  
  setTimeout(() => {
    initChart()
  }, 100)
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-container {
  padding: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--primary-color);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: var(--spacing-md);
  font-size: 24px;
  color: var(--white);
  transition: all var(--transition-fast);
}

.stat-icon.user-icon {
  background-color: rgba(216, 31, 38, 0.8);
  box-shadow: 0 0 15px rgba(216, 31, 38, 0.4);
}

.stat-icon.takeaway-icon {
  background-color: rgba(33, 150, 243, 0.8);
  box-shadow: 0 0 15px rgba(33, 150, 243, 0.4);
}

.stat-icon.takeit-icon {
  background-color: rgba(76, 175, 80, 0.8);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
}

.stat-icon.task-icon {
  background-color: rgba(255, 193, 7, 0.8);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: var(--font-size-base);
  color: var(--neutral-dark);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.stat-trend {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.stat-trend.positive {
  color: var(--success-color);
}

.stat-trend.negative {
  color: var(--error-color);
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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.chart-container {
  width: 100%;
  height: 400px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}
</style>
