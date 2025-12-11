<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>{{ title }}</h3>
      <div class="form-group">
        <slot />
      </div>
      <div class="modal-actions">
        <button @click="$emit('save')" class="btn btn-primary">
          {{ saveLabel }}
        </button>
        <button @click="$emit('close')" class="btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    saveLabel?: string
  }>(),
  {
    title: 'Modal',
    saveLabel: 'Save',
  },
)

defineEmits<{
  close: []
  save: []
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  min-width: 400px;
}

h3 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
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
