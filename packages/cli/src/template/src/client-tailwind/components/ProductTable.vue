<template>
  <div class="card overflow-hidden">
    <table class="w-full">
      <thead>
        <tr class="bg-slate-50 border-b border-slate-200">
          <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">ID</th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id" class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
          <td class="px-6 py-3 text-sm text-slate-700">{{ product.id }}</td>
          <td class="px-6 py-3 text-sm font-medium text-slate-900">{{ product.name }}</td>
          <td class="px-6 py-3 text-sm text-slate-700">${{ product.price.toFixed(2) }}</td>
          <td class="px-6 py-3 text-sm">
            <div class="flex gap-2 flex-wrap">
              <router-link :to="`/product/${product.id}`" class="btn btn-sm btn-primary">View</router-link>
              <button @click="$emit('progress', product.id)" class="btn btn-sm btn-info">Progress</button>
              <button @click="$emit('delete', product.id)" class="btn btn-sm btn-danger">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Product } from '../../../../base/src/shared';

defineProps<{
  products: Product[];
}>();

defineEmits<{
  progress: [id: number];
  delete: [id: number];
}>();
</script>
