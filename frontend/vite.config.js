import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        // Automatically targets your live Render instance or falls back to localhost during local coding
        target: process.env.NODE_ENV === 'production' 
          ? 'https://akashs-tacos.onrender.com' 
          : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
