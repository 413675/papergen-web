import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:11800',
        changeOrigin: true,
        // 后端不保留 /api 前缀，由前端代理剥离
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
