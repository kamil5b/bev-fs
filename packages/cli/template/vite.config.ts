import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  root: 'src/app',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  }
});
