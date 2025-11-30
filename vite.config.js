import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 3000,
    strictPort: true, // optional: fail if 3000 is busy instead of falling back
    proxy: {
      // Proxy API requests đến backend để tránh CORS issues
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Không rewrite path, giữ nguyên /api
      },
    },
  },
})
