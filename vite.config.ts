import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'https://api.zbayhalmmlkh.network',
        changeOrigin: true,
        secure: false,
      },
      '/web': {
        target: 'https://api.zbayhalmmlkh.network',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});