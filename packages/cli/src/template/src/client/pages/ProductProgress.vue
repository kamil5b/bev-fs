<template>
  <div class="progress-container">
    <PageHeader 
      title="Product Progress"
      backTo="/"
      backLabel="← Back to Products"
    />

    <div v-if="product" class="progress-content">
      <ProductDetail :product="product" />

      <div class="progress-section">
        <h3>Production Progress</h3>
        <div v-if="progresses.length === 0" class="empty-state">
          <p>No progress records yet.</p>
        </div>
        <div v-else class="progress-list">
          <ProgressItem 
            v-for="progress in progresses" 
            :key="progress.id"
            :progress="progress"
            @edit="editProgress(progress)"
            @delete="deleteProgress(progress.id)"
          />
        </div>
      </div>

      <ProgressForm 
        buttonLabel="Add Progress"
        @submit="addProgress"
        @update="(data) => newProgress = data"
      />
    </div>

    <LoadingSpinner v-else message="Loading product..." />

    <!-- Edit Modal -->
    <Modal 
      :isOpen="editing"
      title="Edit Progress"
      saveLabel="Save"
      @close="editing = false"
      @save="saveEdit"
    >
      <select v-model="editForm.status" class="input">
        <option value="planning">Planning</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <textarea v-model="editForm.description" class="input"></textarea>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductAPI } from '../composables/useProductAPI';
import { Product, Progress } from '../../shared';
import PageHeader from '../components/PageHeader.vue';
import ProductDetail from '../components/ProductDetail.vue';
import ProgressItem from '../components/ProgressItem.vue';
import ProgressForm from '../components/ProgressForm.vue';
import Modal from '../components/Modal.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();
const { get, listProgress, createProgress, updateProgress, deleteProgress: removeProgress } = useProductAPI();
const product = ref<Product | null>(null);
const progresses = ref<Progress[]>([]);
const editing = ref(false);
const editingId = ref<number | null>(null);
const newProgress = ref({ status: 'planning', description: '' });
const editForm = ref({ status: 'planning', description: '' });

onMounted(async () => {
  const productId = Number(route.params.id);
  try {
    const data = await get(productId);
    product.value = data.product;
    
    // Load progress items for this product
    const progressData = await listProgress(productId);
    progresses.value = progressData.progress;
  } catch (error) {
    console.error('Failed to load product:', error);
    router.push('/');
  }
});

async function addProgress() {
  if (!product.value || !newProgress.value.description) return;

  try {
    const response = await createProgress(
      product.value.id,
      newProgress.value
    );
    progresses.value.push(response.created);
    newProgress.value = { status: 'planning', description: '' };
  } catch (error) {
    console.error('Failed to add progress:', error);
  }
}

function editProgress(progress: Progress) {
  editForm.value = { 
    status: progress.status, 
    description: progress.description ?? '' 
  };
  editingId.value = progress.id;
  editing.value = true;
}

async function saveEdit() {
  if (!product.value || !editingId.value) return;

  try {
    const response = await updateProgress(
      product.value.id,
      editingId.value,
      editForm.value
    );
    const index = progresses.value.findIndex(p => p.id === editingId.value);
    if (index !== -1) {
      progresses.value[index] = response.updated;
    }
    editing.value = false;
    editingId.value = null;
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

async function deleteProgress(id: number) {
  if (!product.value || !confirm('Delete this progress record?')) return;

  try {
    await removeProgress(product.value.id, id);
    progresses.value = progresses.value.filter(p => p.id !== id);
  } catch (error) {
    console.error('Failed to delete progress:', error);
  }
}
</script>

<style scoped>
.progress-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.progress-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-section {
  margin-bottom: 2rem;
}

.progress-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 4px;
  color: #999;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

textarea.input {
  resize: vertical;
  min-height: 100px;
}
</style>
