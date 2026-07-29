import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:5173' }
    },
    setupFiles: './src/test/setup.js',
    globals: true,
    testTimeout: 15000
  }
})
