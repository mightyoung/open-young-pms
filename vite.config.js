import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API proxy target — must match backend port (see README.md §端口规范)
const API_PROXY_TARGET = 'http://localhost:8001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-charts': ['recharts'],
          'vendor-framer': ['framer-motion'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
})
