<template>
  <div class="product-detail">
    <div class="product-info">
      <h2>{{ product.name }}</h2>
      <p class="price">${{ product.price.toFixed(2) }}</p>
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from '../../shared'

defineProps<{
  product: Product
}>()
</script>

<style scoped>
.product-detail {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-info h2 {
  margin: 0 0 1rem;
  color: #2c3e50;
  font-size: 2rem;
}

.price {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: 600;
  margin: 0 0 1.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
}
</style>
