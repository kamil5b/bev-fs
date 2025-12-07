<template>
  <div class="home">
    <h1>Welcome to Bun Elysia Vue Base</h1>
    <p>This is a minimal framework-driven starter template.</p>
    
    <div class="features">
      <div class="feature">
        <h3>⚡ Bun</h3>
        <p>Fast JavaScript runtime</p>
      </div>
      <div class="feature">
        <h3>🛣️ File-Based Routing</h3>
        <p>via bev-fs framework</p>
      </div>
      <div class="feature">
        <h3>💚 Vue 3</h3>
        <p>Modern reactive UI</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: #333;
}

p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 40px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.feature {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.feature p {
  color: #666;
  font-size: 0.9rem;
}
</style>
