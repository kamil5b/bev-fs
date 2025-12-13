<template>
  <div class="page-container">
    <PageHeader title="404 - Not Found" backTo="/" backLabel="← Back to Home" />
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
</script>

<style scoped>
.page-container {
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.not-found-content {
  text-align: center;
  margin-top: 2rem;
}

.not-found-content h1 {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.not-found-content h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.not-found-content p {
  color: #666;
  font-size: 1.1rem;
}
</style>
