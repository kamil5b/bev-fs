<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Upload Section -->
    <div class="mb-6">
      <div class="relative mb-4">
        <input
          ref="fileInput"
          type="file"
          multiple
          class="hidden"
          @change="handleFileSelect"
          :disabled="loading"
        />
        <label
          class="flex flex-col items-center justify-center gap-2 p-8 bg-gray-50 border-2 border-dashed border-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          @click="fileInput?.click()"
        >
          <span v-if="!loading" class="text-3xl">📁</span>
          <span v-else class="text-3xl">⏳</span>
          <span class="text-center text-gray-600">
            {{ loading ? 'Uploading...' : 'Click to select files or drag & drop' }}
          </span>
        </label>
      </div>

      <!-- Drag & Drop Zone -->
      <div
        class="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center transition-colors duration-200"
        :class="{ 'border-blue-500 bg-blue-50': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <p class="text-gray-500">Drag files here</p>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="mt-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
      >
        <span class="text-xl flex-shrink-0">❌</span>
        <span class="flex-1">{{ error }}</span>
        <button
          @click="clearError"
          class="text-red-700 hover:text-red-900 text-2xl leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Files List Section -->
    <div v-if="uploadedFiles.length > 0" class="border-t border-gray-200 pt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Uploaded Files ({{ uploadedFiles.length }})
      </h3>
      <div class="space-y-3">
        <div
          v-for="file in uploadedFiles"
          :key="file.fileName"
          class="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-150"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span class="text-2xl flex-shrink-0">📄</span>
            <div class="flex flex-col gap-1 min-w-0">
              <a
                :href="file.url"
                target="_blank"
                class="text-blue-600 hover:text-blue-800 hover:underline font-medium break-words"
              >
                {{ file.fileName }}
              </a>
              <span class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
          <button
            @click="handleDelete(file.fileName)"
            :disabled="loading"
            class="ml-2 text-xl flex-shrink-0 hover:scale-110 transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete file"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>No files uploaded yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFileUpload } from '../composables/useFileUpload';

const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);

const { loading, error, uploadedFiles, upload, deleteFile, listFiles, clearError } =
  useFileUpload();

onMounted(async () => {
  await listFiles();
});

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files ? Array.from(target.files) : [];
  if (files.length > 0) {
    uploadFiles(files);
  }
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
  if (files.length > 0) {
    uploadFiles(files);
  }
}

async function uploadFiles(files: File[]) {
  await upload(files);
}

async function handleDelete(fileName: string) {
  if (confirm(`Delete "${fileName}"?`)) {
    await deleteFile(fileName);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}
</script>
