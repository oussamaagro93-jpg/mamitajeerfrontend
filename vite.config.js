import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic',
  })],
  resolve: {
    alias: {
      events: path.resolve(process.cwd(), 'node_modules/events/events.js'),
    },
  },
  server: {
    port: 3013,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
