import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    watch: { usePolling: true },
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://api:8000',
        changeOrigin: true,
      },
    },
  },
});
