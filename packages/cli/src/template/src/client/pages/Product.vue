<template>
  <div class="product-detail-container">
    <PageHeader 
      title="Product Details"
      backTo="/"
      backLabel="← Back to Products"
    />

    <ProductDetail v-if="product" :product="product">
      <template #actions>
        <button @click="editProduct" class="btn btn-primary">Edit</button>
        <button @click="deleteProduct" class="btn btn-danger">Delete</button>
      </template>
    </ProductDetail>

    <LoadingSpinner v-else message="Loading product..." />

    <!-- Edit Modal -->
    <Modal 
      :isOpen="editing"
      title="Edit Product"
      saveLabel="Save"
      @close="editing = false"
      @save="saveEdit"
    >
      <input v-model="editForm.name" type="text" placeholder="Product name" />
      <input v-model.number="editForm.price" type="number" placeholder="Price" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppRouter, useAppRoute } from 'bev-fs';
import { useProductAPI } from '../composables/useProductAPI';
import { Product } from '../../shared';
import PageHeader from '../components/PageHeader.vue';
import ProductDetail from '../components/ProductDetail.vue';
import Modal from '../components/Modal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useAppRouter();
const route = useAppRoute();
const { get, update, remove } = useProductAPI();
const product = ref<Product | null>(null);
const editing = ref(false);
const editForm = ref({ name: '', price: 0 });

onMounted(async () => {
  const id = Number(route.params.id);
  try {
    const data = await get(id);
    product.value = data.product;
  } catch (error) {
    console.error('Failed to load product:', error);
    router.push('/');
  }
});

function editProduct() {
  if (!product.value) return;
  editForm.value = { ...product.value };
  editing.value = true;
}

async function saveEdit() {
  if (!product.value) return;

  try {
    const updated = await update(product.value.id, editForm.value);
    product.value = updated.updated;
    editing.value = false;
  } catch (error) {
    console.error('Failed to update product:', error);
  }
}

async function deleteProduct() {
  if (!product.value) return;
  
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    await remove(product.value.id);
    router.push('/');
  } catch (error) {
    console.error('Failed to delete product:', error);
  }
}
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>
