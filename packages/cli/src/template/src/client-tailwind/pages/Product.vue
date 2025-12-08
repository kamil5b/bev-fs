<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <PageHeader 
        title="Product Details"
        backTo="/"
        backLabel="← Back to Products"
      />

      <ProductDetail v-if="product" :product="product">
        <template #actions>
          <button @click="editProduct" class="btn btn-primary flex-1">Edit</button>
          <button @click="deleteProduct" class="btn btn-danger flex-1">Delete</button>
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
        <input v-model="editForm.name" type="text" placeholder="Product name" class="input" />
        <input v-model.number="editForm.price" type="number" placeholder="Price" class="input" />
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductAPI } from '../composables/useProductAPI';
import { Product } from '../../../../base/src/shared';
import PageHeader from '../components/PageHeader.vue';
import ProductDetail from '../components/ProductDetail.vue';
import Modal from '../components/Modal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();
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
