<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <PageHeader 
        title="Product Progress"
        backTo="/"
        backLabel="← Back to Products"
      />

      <div v-if="product" class="space-y-8">
        <ProductDetail :product="product" />

        <div class="bg-white rounded-lg shadow-lg p-8">
          <h3 class="text-2xl font-bold text-slate-900 mb-6">Production Progress</h3>
          <div v-if="progresses.length === 0" class="text-center py-12">
            <div class="mb-4">
              <svg class="w-16 h-16 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-slate-600 text-lg">No progress records yet.</p>
          </div>
          <div v-else class="grid gap-4">
            <ProgressItem 
              v-for="progress in progresses" 
              :key="progress.id"
              :progress="progress"
              @edit="editProgress(progress)"
              @delete="deleteProgress(progress.id)"
            />
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-8">
          <h3 class="text-xl font-bold text-slate-900 mb-6">Add Progress</h3>
          <ProgressForm 
            buttonLabel="Add Progress"
            @submit="addProgress"
            @update="(data) => newProgress = data"
          />
        </div>
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
        <label class="text-sm font-medium text-slate-700">Status</label>
        <select v-model="editForm.status" class="input">
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <label class="text-sm font-medium text-slate-700">Percentage</label>
        <input
          v-model.number="editForm.percentage"
          type="number"
          min="0"
          max="100"
          placeholder="Progress percentage"
          class="input"
        />
        <label class="text-sm font-medium text-slate-700">Description</label>
        <textarea v-model="editForm.description" class="input resize-none" rows="4"></textarea>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductAPI } from '../composables/useProductAPI';
import { Product, Progress } from '../../../../base/src/shared';
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
const editingProgress = ref<Progress | null>(null);
const editForm = ref({ status: 'planning', description: '', percentage: 0 });
const newProgress = ref({ status: 'planning', description: '', percentage: 0 });

onMounted(async () => {
  const id = Number(route.params.id);
  try {
    const productData = await get(id);
    product.value = productData.product;

    const progressData = await listProgress(id);
    progresses.value = progressData.progress;
  } catch (error) {
    console.error('Failed to load data:', error);
    router.push('/');
  }
});

async function addProgress() {
  if (!product.value) return;

  try {
    const response = await createProgress(product.value.id, newProgress.value);
    progresses.value.push(response.created);
    newProgress.value = { status: 'planning', description: '', percentage: 0 };
  } catch (error) {
    console.error('Failed to add progress:', error);
  }
}

function editProgress(progress: Progress) {
  editingProgress.value = progress;
  editForm.value = { ...progress };
  editing.value = true;
}

async function saveEdit() {
  if (!product.value || !editingProgress.value) return;

  try {
    const updated = await updateProgress(product.value.id, editingProgress.value.id, editForm.value);
    const index = progresses.value.findIndex(p => p.id === updated.updated.id);
    if (index >= 0) {
      progresses.value[index] = updated.updated;
    }
    editing.value = false;
    editingProgress.value = null;
  } catch (error) {
    console.error('Failed to update progress:', error);
  }
}

async function deleteProgress(id: number) {
  if (!product.value) return;

  if (!confirm('Are you sure you want to delete this progress record?')) {
    return;
  }

  try {
    await removeProgress(product.value.id, id);
    progresses.value = progresses.value.filter(p => p.id !== id);
  } catch (error) {
    console.error('Failed to delete progress:', error);
  }
}
</script>
