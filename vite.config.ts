import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://13.205.72.30:4000', // your backend IP
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
