<template>
  <div class="home">
    <h1>博城帮管理系统</h1>
    <p>欢迎使用博城帮管理系统</p>
    <div class="nav-links">
      <router-link to="/village" class="nav-link">村庄管理</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// HomeView component
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.nav-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.nav-link {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #45a049;
}
</style>