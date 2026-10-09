import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * DEPRECATED DUPLICATE — DO NOT EDIT
 * The canonical app is /src at the repository root. This config lets the folder
 * build that real app (see src/main.jsx) instead of the stale local copy.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Reuse the root app's shared modules so both trees resolve identically
      '@root': path.resolve(__dirname, '..'),
    },
  },
  server: {
    port: 3000,
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        '..',
      ],
    },
    proxy: {
      // All /api/* calls from frontend are forwarded to backend on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
    hmr: {
      overlay: false  // Removes the full-screen error overlay
    }
  }
})
