<template>
  <div class="form-group flex flex-col sm:flex-row gap-3">
    <input
      v-model="formData.name"
      type="text"
      placeholder="Product name"
      class="input flex-1 min-w-0"
      @keyup.enter="$emit('submit')"
    />
    <input
      v-model.number="formData.price"
      type="number"
      placeholder="Price"
      class="input flex-1 min-w-0"
      @keyup.enter="$emit('submit')"
    />
    <button @click="$emit('submit')" class="btn btn-primary whitespace-nowrap">
      {{ buttonLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  initialName?: string
  initialPrice?: number
  buttonLabel?: string
}

withDefaults(defineProps<Props>(), {
  initialName: '',
  initialPrice: 0,
  buttonLabel: 'Submit',
})

const emit = defineEmits<{
  submit: []
  update: [data: { name: string; price: number }]
}>()

const formData = ref({ name: '', price: 0 })

watch(
  () => [formData.value.name, formData.value.price],
  () => {
    emit('update', formData.value)
  },
  { deep: true },
)
</script>
