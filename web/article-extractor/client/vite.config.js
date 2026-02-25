import { defineConfig } from 'vite'

// Vite dev server proxy configuration
export default defineConfig({
  server: {
    proxy: {
      // forward /api requests to backend running on port 4000
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        // keep the /api prefix because the backend mounts routes at /api
        // rewrite: (path) => path.replace(/^\/api/, '') // don't rewrite
      }
    }
  }
})

