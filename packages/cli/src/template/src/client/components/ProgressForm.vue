<template>
  <div class="progress-form">
    <div class="form-group">
      <select v-model="formData.status" class="input">
        <option value="planning">Planning</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <input
        v-model.number="formData.percentage"
        type="number"
        min="0"
        max="100"
        placeholder="Progress percentage"
        class="input"
      />
      <textarea 
        v-model="formData.description" 
        placeholder="Progress description" 
        class="input"
      ></textarea>
      <button @click="$emit('submit')" class="btn btn-primary">{{ buttonLabel }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  initialStatus?: string;
  initialDescription?: string;
  initialPercentage?: number;
  buttonLabel?: string;
}

withDefaults(defineProps<Props>(), {
  initialStatus: 'planning',
  initialDescription: '',
  initialPercentage: 0,
  buttonLabel: 'Submit'
});

const emit = defineEmits<{
  submit: [];
  update: [data: { status: string; description: string; percentage: number }];
}>();

const formData = ref({ status: 'planning', description: '', percentage: 0 });

watch(
  () => [formData.value.status, formData.value.description, formData.value.percentage],
  () => {
    emit('update', formData.value);
  },
  { deep: true }
);
</script>

<style scoped>
.progress-form {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea.input {
  resize: vertical;
  min-height: 100px;
}

.btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.3s;
}

.btn:hover {
  background: #5568d3;
}

.btn-primary {
  background: #667eea;
}

.btn-primary:hover {
  background: #5568d3;
}
</style>
