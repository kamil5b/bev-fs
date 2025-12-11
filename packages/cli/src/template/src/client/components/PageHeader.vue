<template>
  <div class="page-header">
    <div class="back-link">
      <router-link v-if="showBackLink" :to="backTo" class="link"
        >← {{ backLabel }}</router-link
      >
    </div>
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    showBackLink?: boolean
    backTo?: string
    backLabel?: string
  }>(),
  {
    showBackLink: true,
    backTo: '/',
    backLabel: 'Back',
  },
)
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.back-link {
  margin-bottom: 1rem;
}

.link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

.link:hover {
  color: #5568d3;
}

h1 {
  margin: 0;
  color: #2c3e50;
}
</style>
