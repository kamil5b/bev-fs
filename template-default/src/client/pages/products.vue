<template>
  <div class="products-container">
    <h1>Products</h1>

    <!-- Add Product Form -->
    <div class="form-section">
      <h2>Add Product</h2>
      <form @submit.prevent="addProduct">
        <input
          v-model="form.name"
          type="text"
          placeholder="Product name"
          required
        />
        <input
          v-model.number="form.price"
          type="number"
          placeholder="Price"
          step="0.01"
          required
        />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Adding...' : 'Add Product' }}
        </button>
      </form>
    </div>

    <!-- Products Table -->
    <div class="table-section">
      <table v-if="products.length > 0">
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
            <td>
              <input
                v-if="editingId === product.id"
                v-model="editForm.name"
                type="text"
              />
              <span v-else>{{ product.name }}</span>
            </td>
            <td>
              <input
                v-if="editingId === product.id"
                v-model.number="editForm.price"
                type="number"
                step="0.01"
              />
              <span v-else>${{ product.price.toFixed(2) }}</span>
            </td>
            <td class="actions">
              <button
                v-if="editingId === product.id"
                @click="saveEdit(product.id)"
                class="btn-save"
              >
                Save
              </button>
              <button
                v-if="editingId === product.id"
                @click="cancelEdit"
                class="btn-cancel"
              >
                Cancel
              </button>
              <button
                v-if="editingId !== product.id"
                @click="startEdit(product)"
                class="btn-edit"
              >
                Edit
              </button>
              <button
                @click="deleteProduct(product.id)"
                class="btn-delete"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        No products yet. Add one to get started!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { productAPI } from '../api';
import type { Product, ProductAPI } from '../../shared/api';

const products = ref<Product[]>([]);
const loading = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  name: '',
  price: 0
});

const editForm = ref({
  name: '',
  price: 0
});

// Load products on mount
onMounted(async () => {
  await loadProducts();
});

async function loadProducts() {
  try {
    loading.value = true;
    const res = await productAPI.list();
    products.value = res.products;
  } catch (error) {
    console.error('Failed to load products', error);
  } finally {
    loading.value = false;
  }
}

async function addProduct() {
  if (!form.value.name || form.value.price <= 0) return;

  try {
    loading.value = true;
    const res = await productAPI.create({
      name: form.value.name,
      price: form.value.price
    });
    products.value.push(res.created);
    form.value = { name: '', price: 0 };
  } catch (error) {
    console.error('Failed to add product', error);
  } finally {
    loading.value = false;
  }
}

function startEdit(product: Product) {
  editingId.value = product.id;
  editForm.value = {
    name: product.name,
    price: product.price
  };
}

async function saveEdit(id: number) {
  try {
    loading.value = true;
    const res = await productAPI.update(id, {
      name: editForm.value.name,
      price: editForm.value.price
    });
    const index = products.value.findIndex(p => p.id === id);
    if (index !== -1) {
      products.value[index] = res.updated;
    }
    editingId.value = null;
  } catch (error) {
    console.error('Failed to update product', error);
  } finally {
    loading.value = false;
  }
}

function cancelEdit() {
  editingId.value = null;
  editForm.value = { name: '', price: 0 };
}

async function deleteProduct(id: number) {
  if (!confirm('Are you sure?')) return;

  try {
    loading.value = true;
    await productAPI.delete(id);
    products.value = products.value.filter(p => p.id !== id);
  } catch (error) {
    console.error('Failed to delete product', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.products-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  font-size: 18px;
  margin-bottom: 15px;
}

/* Form Section */
.form-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

form {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

form > button {
  background: #0066cc;
  color: white;
}

form > button:hover:not(:disabled) {
  background: #0052a3;
}

form > button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Table Section */
.table-section {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

thead {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

tr:hover {
  background: #f9f9f9;
}

td input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-edit,
.btn-delete,
.btn-save,
.btn-cancel {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #0066cc;
  color: white;
}

.btn-edit:hover {
  background: #0052a3;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-save {
  background: #28a745;
  color: white;
}

.btn-save:hover {
  background: #218838;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>
