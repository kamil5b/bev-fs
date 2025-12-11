<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4"
  >
    <div class="max-w-2xl mx-auto">
      <PageHeader
        title="404 - Not Found"
        backTo="/"
        backLabel="← Back to Home"
      />
      <div class="card p-8 text-center">
        <h1 class="text-7xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Page Not Found</h2>
        <p class="text-lg text-slate-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <router-link to="/" class="btn btn-primary">Return to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../components/PageHeader.vue'
</script>
