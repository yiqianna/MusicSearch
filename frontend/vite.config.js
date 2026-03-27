import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/itunes-api': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/itunes-api/, ''),
      },
      '/mzstatic': {
        target: 'https://is1-ssl.mzstatic.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/mzstatic/, ''),
      },
    },
  },
})
