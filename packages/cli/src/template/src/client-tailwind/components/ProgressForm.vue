<template>
  <div class="pt-8 border-t border-slate-200">
    <div class="form-group">
      <label class="text-sm font-medium text-slate-700">Status</label>
      <select v-model="formData.status" class="input">
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </select>

      <label class="text-sm font-medium text-slate-700"
        >Progress Percentage</label
      >
      <input
        v-model.number="formData.percentage"
        type="number"
        min="0"
        max="100"
        placeholder="Progress percentage"
        class="input"
      />

      <label class="text-sm font-medium text-slate-700">Description</label>
      <textarea
        v-model="formData.description"
        placeholder="Progress description"
        class="input resize-none"
        rows="4"
      ></textarea>

      <button @click="$emit('submit')" class="btn btn-primary w-full">
        {{ buttonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ProgressStatus } from '../../shared'

interface Props {
  initialStatus?: ProgressStatus
  initialDescription?: string
  initialPercentage?: number
  buttonLabel?: string
}

withDefaults(defineProps<Props>(), {
  initialStatus: 'pending' as ProgressStatus,
  initialDescription: '',
  initialPercentage: 0,
  buttonLabel: 'Submit',
})

const emit = defineEmits<{
  submit: []
  update: [
    data: { status: ProgressStatus; description: string; percentage: number },
  ]
}>()

const formData = ref<{
  status: ProgressStatus
  description: string
  percentage: number
}>({
  status: 'pending',
  description: '',
  percentage: 0,
})

watch(
  () => [
    formData.value.status,
    formData.value.description,
    formData.value.percentage,
  ],
  () => {
    emit('update', formData.value)
  },
  { deep: true },
)
</script>
