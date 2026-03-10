<template>
  <div class="village-view">
    <h1>村庄管理</h1>
    
    <!-- 添加村庄表单 -->
    <div class="add-village-form">
      <h2>添加新村庄</h2>
      <div class="form-group">
        <label for="village-name">村庄名称</label>
        <input 
          type="text" 
          id="village-name" 
          v-model="newVillageName" 
          placeholder="请输入村庄名称"
        />
      </div>
      <button @click="addVillage" class="add-button">添加村庄</button>
    </div>
    
    <!-- 村庄列表 -->
    <div class="village-list">
      <h2>村庄列表</h2>
      <div v-if="villages.length === 0" class="no-data">
        暂无村庄数据
      </div>
      <table v-else class="village-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>村庄名称</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="village in villages" :key="village.id">
            <td>{{ village.id }}</td>
            <td>{{ village.name }}</td>
            <td>{{ formatDate(village.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface Village {
  id: number;
  name: string;
  createdAt: string;
}

const villages = ref<Village[]>([]);
const newVillageName = ref('');

// 加载村庄列表
const loadVillages = async () => {
  try {
    const response = await axios.get('http://localhost:3001/village');
    villages.value = response.data;
  } catch (error) {
    console.error('加载村庄列表失败:', error);
  }
};

// 添加新村庄
const addVillage = async () => {
  if (!newVillageName.value.trim()) {
    alert('请输入村庄名称');
    return;
  }
  
  try {
    const response = await axios.post('http://localhost:3001/village', {
      name: newVillageName.value
    });
    villages.value.push(response.data);
    newVillageName.value = '';
  } catch (error) {
    console.error('添加村庄失败:', error);
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 组件挂载时加载村庄列表
onMounted(() => {
  loadVillages();
});
</script>

<style scoped>
.village-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #555;
}

.add-village-form {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #666;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.add-button {
  background-color: #4CAF50;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #45a049;
}

.village-list {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.village-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.village-table th,
.village-table td {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.village-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #333;
}

.village-table tr:hover {
  background-color: #f5f5f5;
}
</style>