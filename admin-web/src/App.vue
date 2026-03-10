<template>
  <div class="app">
    <header class="header">
      <h1>博城帮管理系统</h1>
    </header>
    <main class="main">
      <router-view></router-view>
    </main>
    <footer class="footer">
      <p>© 2026 博城帮管理系统</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #4CAF50;
  color: white;
  padding: 1rem;
  text-align: center;
}

.header h1 {
  font-size: 1.5rem;
}

.main {
  flex: 1;
  padding: 1rem;
}

.footer {
  background-color: #333;
  color: white;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}
</style>
