<template>
  <div class="product-detail-container">
    <div class="back-button">
      <router-link to="/">&larr; Back to Products</router-link>
    </div>

    <h1 v-if="product">{{ product.name }}</h1>
    <div v-else class="loading">Loading product...</div>

    <div v-if="product" class="product-info">
      <p class="price">${{ product.price.toFixed(2) }}</p>
    </div>

    <!-- Progress List -->
    <div v-if="product" class="progress-section">
      <h2>Progress</h2>

      <!-- Add Progress Form -->
      <div class="form-section">
        <h3>Add Progress</h3>
        <form @submit.prevent="addProgress">
          <input
            v-model.number="progressForm.percentage"
            type="number"
            placeholder="Percentage (0-100)"
            min="0"
            max="100"
            required
          />
          <select v-model="progressForm.status" required>
            <option value="">Select status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Adding...' : 'Add Progress' }}
          </button>
        </form>
      </div>

      <!-- Progress Table -->
      <div class="table-section">
        <table v-if="progressList.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="progress in progressList" :key="progress.id">
              <td>{{ progress.id }}</td>
              <td>
                <input
                  v-if="editingId === progress.id"
                  v-model.number="editForm.percentage"
                  type="number"
                  min="0"
                  max="100"
                />
                <span v-else>{{ progress.percentage }}%</span>
              </td>
              <td>
                <select v-if="editingId === progress.id" v-model="editForm.status">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                <span v-else class="status" :class="`status-${progress.status}`">
                  {{ progress.status }}
                </span>
              </td>
              <td>{{ formatDate(progress.createdAt) }}</td>
              <td>{{ formatDate(progress.updatedAt) }}</td>
              <td class="actions">
                <button
                  v-if="editingId === progress.id"
                  @click="saveEdit(progress.id)"
                  class="btn-save"
                >
                  Save
                </button>
                <button
                  v-if="editingId === progress.id"
                  @click="cancelEdit"
                  class="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  v-if="editingId !== progress.id"
                  @click="startEdit(progress)"
                  class="btn-edit"
                >
                  Edit
                </button>
                <button
                  @click="deleteProgress(progress.id)"
                  class="btn-delete"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          No progress entries yet. Add one to get started!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productAPI } from '../api';
import type { Product, Progress, ProgressAPI } from '../../shared/api';

const route = useRoute();
const router = useRouter();
const productId = parseInt(route.params.productId as string);

const product = ref<Product | null>(null);
const progressList = ref<Progress[]>([]);
const loading = ref(false);
const editingId = ref<number | null>(null);

const progressForm = ref({
  percentage: 0,
  status: 'pending' as const
});

const editForm = ref({
  percentage: 0,
  status: 'pending' as const
});

onMounted(async () => {
  await loadProduct();
  await loadProgress();
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

async function loadProgress() {
  try {
    const res = await fetch(`/api/product/${productId}/progress`);
    const data = await res.json() as ProgressAPI.GetListResponse;
    progressList.value = data.progress;
  } catch (error) {
    console.error('Failed to load progress', error);
  }
}

async function addProgress() {
  if (progressForm.value.percentage < 0 || progressForm.value.percentage > 100) return;

  try {
    loading.value = true;
    const res = await fetch(`/api/product/${productId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        percentage: progressForm.value.percentage,
        status: progressForm.value.status
      })
    });
    const data = await res.json() as ProgressAPI.CreateResponse;
    progressList.value.push(data.created);
    progressForm.value = { percentage: 0, status: 'pending' };
  } catch (error) {
    console.error('Failed to add progress', error);
  } finally {
    loading.value = false;
  }
}

function startEdit(progress: Progress) {
  editingId.value = progress.id;
  editForm.value = {
    percentage: progress.percentage,
    status: progress.status
  };
}

async function saveEdit(id: number) {
  try {
    loading.value = true;
    const res = await fetch(`/api/product/${productId}/progress/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        percentage: editForm.value.percentage,
        status: editForm.value.status
      })
    });
    const data = await res.json() as ProgressAPI.UpdateResponse;
    const index = progressList.value.findIndex(p => p.id === id);
    if (index !== -1) {
      progressList.value[index] = data.updated;
    }
    editingId.value = null;
  } catch (error) {
    console.error('Failed to update progress', error);
  } finally {
    loading.value = false;
  }
}

function cancelEdit() {
  editingId.value = null;
  editForm.value = { percentage: 0, status: 'pending' };
}

async function deleteProgress(id: number) {
  if (!confirm('Are you sure?')) return;

  try {
    loading.value = true;
    await fetch(`/api/product/${productId}/progress/${id}`, {
      method: 'DELETE'
    });
    progressList.value = progressList.value.filter(p => p.id !== id);
  } catch (error) {
    console.error('Failed to delete progress', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
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

h2 {
  color: #555;
  font-size: 20px;
  margin-top: 30px;
  margin-bottom: 20px;
}

h3 {
  color: #555;
  font-size: 16px;
  margin-bottom: 15px;
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
  margin: 0;
}

.loading {
  text-align: center;
  color: #999;
  padding: 20px;
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

input,
select {
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus,
select:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

form > button {
  padding: 8px 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
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
  font-size: 13px;
}

td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

tr:hover {
  background: #f9f9f9;
}

td input,
td select {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.status {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-in-progress {
  background: #cfe2ff;
  color: #084298;
}

.status-completed {
  background: #d1e7dd;
  color: #0f5132;
}

.status-failed {
  background: #f8d7da;
  color: #842029;
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
  font-size: 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
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

.progress-section {
  margin-top: 30px;
}
</style>
