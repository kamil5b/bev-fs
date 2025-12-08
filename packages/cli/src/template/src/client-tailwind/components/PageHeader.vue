<template>
  <div class="mb-8 border-b border-slate-200 pb-6">
    <div class="mb-4" v-if="showBackLink">
      <router-link :to="backTo" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        {{ backLabel }}
      </router-link>
    </div>
    <h1 class="text-3xl font-bold text-slate-900">{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    showBackLink?: boolean;
    backTo?: string;
    backLabel?: string;
  }>(),
  {
    showBackLink: true,
    backTo: '/',
    backLabel: 'Back'
  }
);
</script>
