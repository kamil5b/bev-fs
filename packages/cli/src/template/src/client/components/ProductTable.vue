<template>
  <table class="products-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in products" :key="product.id">
        <td>{{ product.id }}</td>
        <td>{{ product.name }}</td>
        <td>${{ product.price.toFixed(2) }}</td>
        <td class="actions">
          <router-link :to="`/product/${product.id}`" class="btn btn-sm"
            >View</router-link
          >
          <button
            @click="$emit('progress', product.id)"
            class="btn btn-sm btn-info"
          >
            Progress
          </button>
          <button
            @click="$emit('delete', product.id)"
            class="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { Product } from '../../shared'

defineProps<{
  products: Product[]
}>()

defineEmits<{
  progress: [id: number]
  delete: [id: number]
}>()
</script>

<style scoped>
.products-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  margin-bottom: 1rem;
}

.products-table thead {
  background: #f0f0f0;
  border-bottom: 2px solid #ddd;
}

.products-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
}

.products-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.products-table tbody tr:hover {
  background: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.3s;
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  background: #5568d3;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-info {
  background: #42b983;
}

.btn-info:hover {
  background: #369970;
}

.btn-danger {
  background: #e74c3c;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
