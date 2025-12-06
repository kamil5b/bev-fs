<template>
  <div class="loading">{{ message }}</div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string;
  }>(),
  {
    message: 'Loading...'
  }
);
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
