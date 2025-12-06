<template>
  <div class="welcome-container">
    <div class="welcome-header">
      <h1>Welcome to bev-fs</h1>
      <p class="welcome-text">
        Thank you for choosing bev-fs! This is a production-ready fullstack framework 
        that combines Vue 3, Elysia, Bun, and Vite for a seamless development experience.
      </p>
    </div>

    <div class="crud-section">
      <h2>Product Management</h2>
      <p>Manage your products with full CRUD operations below:</p>

      <div class="form-group">
        <input 
          v-model="newProduct.name" 
          type="text" 
          placeholder="Product name"
          @keyup.enter="addProduct"
        />
        <input 
          v-model.number="newProduct.price" 
          type="number" 
          placeholder="Price"
          @keyup.enter="addProduct"
        />
        <button @click="addProduct" class="btn btn-primary">Add Product</button>
      </div>

      <div v-if="loading" class="loading">Loading products...</div>
      
      <table v-else class="products-table">
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
            <td>
              <router-link :to="`/product/${product.id}`" class="btn btn-sm">View</router-link>
              <button @click="viewProgress(product.id)" class="btn btn-sm btn-info">Progress</button>
              <button @click="deleteProduct(product.id)" class="btn btn-sm btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { productAPI } from '../../api';

interface Product {
  id: number;
  name: string;
  price: number;
}

const router = useRouter();
const products = ref<Product[]>([]);
const loading = ref(false);
const newProduct = ref({ name: '', price: 0 });

onMounted(async () => {
  await loadProducts();
});

async function loadProducts() {
  loading.value = true;
  try {
    const data = await productAPI.list();
    products.value = data.products;
  } finally {
    loading.value = false;
  }
}

async function addProduct() {
  if (!newProduct.value.name || !newProduct.value.price) {
    alert('Please fill in all fields');
    return;
  }

  const response = await productAPI.create(newProduct.value);
  products.value.push(response.created);
  newProduct.value = { name: '', price: 0 };
}

async function deleteProduct(id: number) {
  if (!confirm('Delete this product?')) return;
  
  await productAPI.delete(id);
  products.value = products.value.filter((p: any) => p.id !== id);
}

function viewProgress(productId: number) {
  router.push(`/product/${productId}/progress`);
}
</script>

<style scoped>
.welcome-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

.welcome-header h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

.welcome-text {
  margin: 0;
  font-size: 1.1em;
  line-height: 1.6;
}

.crud-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.crud-section h2 {
  margin-top: 0;
  color: #333;
}

.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.form-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #f0f0f0;
  color: #333;
  cursor: pointer;
  font-size: 0.95em;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.85em;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.products-table thead {
  background: #f5f5f5;
}

.products-table th,
.products-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.products-table th {
  font-weight: 600;
  color: #333;
}

.products-table tr:hover {
  background: #f9f9f9;
}

.products-table td {
  display: table-cell;
}

.products-table button {
  margin-right: 5px;
}
</style>
