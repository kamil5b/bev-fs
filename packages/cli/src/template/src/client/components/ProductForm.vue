<template>
  <div class="form-group">
    <input 
      v-model="formData.name" 
      type="text" 
      placeholder="Product name"
      @keyup.enter="$emit('submit')"
    />
    <input 
      v-model.number="formData.price" 
      type="number" 
      placeholder="Price"
      @keyup.enter="$emit('submit')"
    />
    <button @click="$emit('submit')" class="btn btn-primary">{{ buttonLabel }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  initialName?: string;
  initialPrice?: number;
  buttonLabel?: string;
}

withDefaults(defineProps<Props>(), {
  initialName: '',
  initialPrice: 0,
  buttonLabel: 'Submit'
});

const emit = defineEmits<{
  submit: [];
  update: [data: { name: string; price: number }];
}>();

const formData = ref({ name: '', price: 0 });

watch(
  () => [formData.value.name, formData.value.price],
  () => {
    emit('update', formData.value);
  },
  { deep: true }
);
</script>

<style scoped>
.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
