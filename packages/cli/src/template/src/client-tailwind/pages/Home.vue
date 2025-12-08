<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="mb-12">
        <div class="text-center mb-8">
          <h1 class="text-5xl font-bold text-slate-900 mb-4">Welcome to bev-fs</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Thank you for choosing bev-fs! This is a production-ready fullstack framework 
            that combines Vue 3, Elysia, Bun, and Vite for a seamless development experience.
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Product Management</h2>
        <p class="text-slate-600 mb-6">Manage your products with full CRUD operations below:</p>

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
        <input v-model="editingProduct!.name" type="text" placeholder="Product name" class="input" />
        <input v-model.number="editingProduct!.price" type="number" placeholder="Price" class="input" />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductAPI } from '../composables/useProductAPI';
import { Product } from '../../../../base/src/shared';
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

function editProduct(product: Product) {
  editingProduct.value = { ...product };
}

async function saveEdit() {
  if (!editingProduct.value) return;

  try {
    const updated = await update(editingProduct.value.id, editingProduct.value);
    const index = products.value.findIndex(p => p.id === updated.updated.id);
    if (index >= 0) {
      products.value[index] = updated.updated;
    }
    editingProduct.value = null;
  } catch (error) {
    console.error('Failed to update product:', error);
  }
}
</script>
