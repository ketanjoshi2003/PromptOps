import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split @xyflow/react and related flow dependencies
            if (id.includes('@xyflow') || id.includes('dagre')) {
              return 'vendor-xyflow';
            }
            // Split react-icons
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            // Split react-markdown and related text-parsing packages
            if (id.includes('react-markdown') || id.includes('vfile') || id.includes('unist') || id.includes('unified')) {
              return 'vendor-markdown';
            }
            // Core react packages
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Rest of dependencies
            return 'vendor-others';
          }
        }
      }
    }
  }
})
