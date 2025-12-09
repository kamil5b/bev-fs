import { ref } from 'vue';
import type { UploadedFile } from '@/shared';

export function useFileUpload() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uploadedFiles = ref<UploadedFile[]>([]);

  /**
   * Upload one or more files
   */
  async function upload(files: File[]): Promise<UploadedFile[] | null> {
    if (!files || files.length === 0) {
      error.value = 'No files selected';
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        error.value = data.message || 'Upload failed';
        return null;
      }

      uploadedFiles.value = [...uploadedFiles.value, ...data.files];
      return data.files;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upload failed';
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete a file
   */
  async function deleteFile(fileName: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/file/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        error.value = data.message || 'Delete failed';
        return false;
      }

      uploadedFiles.value = uploadedFiles.value.filter(f => f.fileName !== fileName);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Delete failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * List all uploaded files
   */
  async function listFiles(): Promise<UploadedFile[] | null> {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/file', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`List failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        error.value = data.message || 'Failed to list files';
        return null;
      }

      uploadedFiles.value = data.files;
      return data.files;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to list files';
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Clear the uploaded files list
   */
  function clearFiles() {
    uploadedFiles.value = [];
  }

  /**
   * Download a file
   */
  async function downloadFile(fileName: string): Promise<void> {
    try {
      const response = await fetch(`/api/file/${encodeURIComponent(fileName)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Download failed';
    }
  }

  /**
   * Clear error message
   */
  function clearError() {
    error.value = null;
  }

  return {
    loading,
    error,
    uploadedFiles,
    upload,
    deleteFile,
    downloadFile,
    listFiles,
    clearFiles,
    clearError,
  };
}
