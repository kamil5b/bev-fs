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

      <ProductForm 
        :initialName="newProduct.name"
        :initialPrice="newProduct.price"
        buttonLabel="Add Product"
        @submit="addProduct"
        @update="(data) => newProduct = data"
      />

      <LoadingSpinner v-if="loading" message="Loading products..." />
      
      <ProductTable 
        v-else
        :products="products"
        @progress="viewProgress"
        @delete="deleteProduct"
      />
    </div>

    <!-- Edit Modal -->
    <Modal 
      :isOpen="editingProduct !== null"
      title="Edit Product"
      saveLabel="Save"
      @close="editingProduct = null"
      @save="saveEdit"
    >
      <input v-model="editingProduct!.name" type="text" placeholder="Product name" />
      <input v-model.number="editingProduct!.price" type="number" placeholder="Price" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductAPI } from '../composables/useProductAPI';
import { Product } from '../../shared';
import ProductForm from '../components/ProductForm.vue';
import ProductTable from '../components/ProductTable.vue';
import Modal from '../components/Modal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const { list, create, remove, update } = useProductAPI();
const products = ref<Product[]>([]);
const loading = ref(false);
const newProduct = ref({ name: '', price: 0 });
const editingProduct = ref<Product | null>(null);

onMounted(async () => {
  await loadProducts();
});

async function loadProducts() {
  loading.value = true;
  try {
    const data = await list();
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

  const response = await create(newProduct.value);
  products.value.push(response.created);
  newProduct.value = { name: '', price: 0 };
}

async function deleteProduct(id: number) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  await remove(id);
  products.value = products.value.filter(p => p.id !== id);
}

function viewProgress(productId: number) {
  router.push(`/product/${productId}/progress`);
}

async function saveEdit() {
  if (!editingProduct.value) return;
  
  const updated = await update(editingProduct.value.id, {
    name: editingProduct.value.name,
    price: editingProduct.value.price,
  });
  
  const index = products.value.findIndex(p => p.id === editingProduct.value!.id);
  if (index !== -1) {
    products.value[index] = updated.updated;
  }
  
  editingProduct.value = null;
}
</script>

<style scoped>
.welcome-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-header {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem;
  color: #2c3e50;
}

.welcome-text {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.crud-section {
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.crud-section h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.crud-section p {
  color: #666;
  margin-bottom: 1.5rem;
}
</style>
