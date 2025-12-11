<template>
  <div class="card p-6">
    <div class="mb-6">
      <h2 class="text-3xl font-bold text-slate-900 mb-2">{{ product.name }}</h2>
      <p class="text-3xl font-bold text-indigo-600">
        ${{ product.price.toFixed(2) }}
      </p>
    </div>
    <div class="flex gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from '../../shared'

defineProps<{
  product: Product
}>()
</script>
