<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div class="card w-full max-w-md shadow-xl" @click.stop>
      <div class="p-6">
        <h3 class="text-xl font-bold text-slate-900 mb-4">{{ title }}</h3>
        <div class="form-group">
          <slot />
        </div>
        <div class="flex gap-3 mt-6 justify-end">
          <button @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="$emit('save')" class="btn btn-primary">
            {{ saveLabel }}
          </button>
        </div>
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
