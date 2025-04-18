import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/js-api/blueprint': {
        target: 'https://www.fuzzwork.co.uk/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/js-api/, '')
      },
      '/js-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/js-api/, '')
      },
      '/login/oauth2/code/eve': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
