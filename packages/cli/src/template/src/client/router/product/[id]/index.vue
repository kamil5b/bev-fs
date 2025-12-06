<template>
  <div class="product-detail-container">
    <div class="back-button">
      <router-link to="/product">&larr; Back to Products</router-link>
    </div>

    <h1 v-if="product">{{ product.name }}</h1>
    <div v-else class="loading">Loading product...</div>

    <div v-if="product" class="product-info">
      <p class="price">${{ product.price.toFixed(2) }}</p>
      <router-link :to="`/product/${product.id}/progress`" class="view-progress">
        View Progress
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { productAPI } from '../../../api';
import type { Product } from '../../../shared/api';

const route = useRoute();
const productId = parseInt(route.params.id as string);

const product = ref<Product | null>(null);
const loading = ref(false);

onMounted(async () => {
  await loadProduct();
});

async function loadProduct() {
  try {
    loading.value = true;
    const res = await productAPI.getById(productId);
    product.value = res.product;
  } catch (error) {
    console.error('Failed to load product', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.product-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.back-button a {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
}

.back-button a:hover {
  text-decoration: underline;
}

h1 {
  color: #333;
  margin-bottom: 10px;
}

.product-info {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 30px;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #0066cc;
  margin: 0 0 15px 0;
}

.view-progress {
  display: inline-block;
  background: #0066cc;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.2s;
}

.view-progress:hover {
  background: #0052a3;
}

.loading {
  text-align: center;
  color: #999;
  padding: 20px;
}
</style>
