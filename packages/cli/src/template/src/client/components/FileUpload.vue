<template>
  <div class="file-upload-container">
    <!-- Upload Section -->
    <div class="upload-section">
      <div class="upload-input-wrapper">
        <input
          ref="fileInput"
          type="file"
          multiple
          class="file-input"
          @change="handleFileSelect"
          :disabled="loading"
        />
        <label class="upload-label" @click="fileInput?.click()">
          <span v-if="!loading" class="upload-icon">📁</span>
          <span v-else class="upload-icon">⏳</span>
          <span class="upload-text">
            {{
              loading ? 'Uploading...' : 'Click to select files or drag & drop'
            }}
          </span>
        </label>
      </div>

      <!-- Drag & Drop Zone -->
      <div
        class="drag-drop-zone"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="{ dragging: isDragging }"
      >
        <p>Drag files here</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <span class="error-icon">❌</span>
        {{ error }}
        <button @click="clearError" class="error-close">×</button>
      </div>
    </div>

    <!-- Files List Section -->
    <div v-if="uploadedFiles.length > 0" class="files-section">
      <h3>Uploaded Files ({{ uploadedFiles.length }})</h3>
      <div class="files-list">
        <div
          v-for="file in uploadedFiles"
          :key="file.fileName"
          class="file-item"
        >
          <div class="file-info">
            <span class="file-icon">📄</span>
            <div class="file-details">
              <span class="file-name">{{ file.fileName }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
          <div class="file-actions">
            <button
              @click="handleDownload(file.fileName)"
              :disabled="loading"
              class="download-button"
              title="Download file"
            >
              ⬇️
            </button>
            <button
              @click="handleDelete(file.fileName)"
              :disabled="loading"
              class="delete-button"
              title="Delete file"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No files uploaded yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFileUpload } from '../composables/useFileUpload'

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const {
  loading,
  error,
  uploadedFiles,
  upload,
  deleteFile,
  downloadFile,
  listFiles,
  clearError,
} = useFileUpload()

onMounted(async () => {
  await listFiles()
})

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []
  if (files.length > 0) {
    uploadFiles(files)
  }
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleDownload(fileName: string) {
  await downloadFile(fileName)
}

async function uploadFiles(files: File[]) {
  await upload(files)
}

async function handleDelete(fileName: string) {
  if (confirm(`Delete "${fileName}"?`)) {
    await deleteFile(fileName)
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload-container {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

/* Upload Section */
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.file-input {
  display: none;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  background: #f9f9f9;
  border: 2px dashed #2c3e50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-label:hover {
  background: #f0f0f0;
  border-color: #3498db;
}

.upload-icon {
  font-size: 2rem;
}

.upload-text {
  font-size: 0.95rem;
  color: #666;
  text-align: center;
}

/* Drag & Drop */
.drag-drop-zone {
  padding: 1.5rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  color: #999;
  transition: all 0.3s ease;
}

.drag-drop-zone.dragging {
  border-color: #3498db;
  background: #ebf5fb;
  color: #3498db;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #c33;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.error-close:hover {
  color: #a00;
}

/* Files Section */
.files-section {
  margin-top: 1.5rem;
}

.files-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f0f0f0;
  border-color: #d0d0d0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.file-name {
  color: #3498db;
  background: none;
  border: none;
  text-decoration: none;
  word-break: break-word;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.file-name:hover {
  text-decoration: underline;
}

.file-size {
  font-size: 0.85rem;
  color: #999;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.download-button,
.delete-button {
  padding: 0.5rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.download-button:hover,
.delete-button:hover {
  transform: scale(1.2);
}

.download-button:disabled,
.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
}
</style>
