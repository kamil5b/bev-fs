<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <router-link to="/" class="home-link">Back to Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.not-found-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

h1 {
  font-size: 5rem;
  margin: 0;
  color: #667eea;
  font-weight: bold;
}

h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0.5rem 0 1rem;
}

p {
  color: #666;
  margin: 0 0 2rem;
  font-size: 1.1rem;
}

.home-link {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 5px;
  text-decoration: none;
  transition: background 0.3s;
  font-weight: 500;
}

.home-link:hover {
  background: #764ba2;
}
</style>
