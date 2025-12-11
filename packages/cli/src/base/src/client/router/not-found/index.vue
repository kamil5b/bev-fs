<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <router-link to="/">Go home</router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

h1 {
  font-size: 4rem;
  color: #999;
  margin-bottom: 20px;
}

p {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 30px;
}

a {
  padding: 10px 20px;
  background: #333;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

a:hover {
  background: #555;
}
</style>
