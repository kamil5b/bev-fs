<template>
  <div class="card p-4 hover:shadow-lg transition-shadow">
    <div class="flex justify-between items-start mb-3">
      <span class="badge" :class="`badge-${progress.status}`">{{ progress.status }}</span>
      <span class="text-xs text-slate-500">{{ new Date(progress.updatedAt).toLocaleDateString() }}</span>
    </div>
    <p class="text-slate-700 mb-3 leading-relaxed">{{ progress.description }}</p>
    <p class="text-sm font-semibold text-slate-900 mb-4">Progress: <span class="text-indigo-600">{{ progress.percentage }}%</span></p>
    <div class="w-full bg-slate-200 rounded-full h-2 mb-4">
      <div class="bg-indigo-600 h-2 rounded-full transition-all" :style="{ width: progress.percentage + '%' }"></div>
    </div>
    <div class="flex gap-2">
      <button @click="$emit('edit')" class="btn btn-sm btn-primary flex-1">Edit</button>
      <button @click="$emit('delete')" class="btn btn-sm btn-danger flex-1">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Progress } from '../../../../base/src/shared';

defineProps<{
  progress: Progress;
}>();

defineEmits<{
  edit: [];
  delete: [];
}>();
</script>
