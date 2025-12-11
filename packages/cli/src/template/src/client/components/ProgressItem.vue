<template>
  <div class="progress-item">
    <div class="progress-header-item">
      <span class="status" :class="progress.status">{{ progress.status }}</span>
      <span class="date">{{
        new Date(progress.updatedAt).toLocaleDateString()
      }}</span>
    </div>
    <p class="description">{{ progress.description }}</p>
    <p class="percentage">Progress: {{ progress.percentage }}%</p>
    <div class="action-buttons">
      <button @click="$emit('edit')" class="btn btn-sm btn-primary">
        Edit
      </button>
      <button @click="$emit('delete')" class="btn btn-sm btn-danger">
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Progress } from '../../shared'

defineProps<{
  progress: Progress
}>()

defineEmits<{
  edit: []
  delete: []
}>()
</script>

<style scoped>
.percentage {
  color: #333;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.progress-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1.5rem;
  background: #fafafa;
  transition: box-shadow 0.3s;
}

.progress-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.pending {
  background: #e3f2fd;
  color: #1976d2;
}

.status.in-progress {
  background: #fff3e0;
  color: #f57c00;
}

.status.completed {
  background: #e8f5e9;
  color: #388e3c;
}

.status.failed {
  background: #ffebee;
  color: #d32f2f;
}

.date {
  color: #999;
  font-size: 0.875rem;
}

.description {
  margin: 0.5rem 0 1rem;
  color: #666;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
