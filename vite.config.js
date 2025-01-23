import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // If you use @ alias for the src directory
    },
  },
  build: {
    manifest: true, // Ensure Vite generates a manifest file
    outDir: '../../../public/vendor/apitoolz', // Correct output directory
    emptyOutDir: true, // Ensure the output directory is cleared before each build
    rollupOptions: {
      input: path.resolve(__dirname, 'resources/js/main.tsx'), // Correct entry file path
    },
  },
});
