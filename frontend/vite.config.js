import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/newkotainter/', // Menggunakan base path subfolder XAMPP
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/newkotainter/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: '../',
    emptyOutDir: false // Mencegah penghapusan folder /api/ dan .git/
  }
})
