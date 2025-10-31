import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    sourcemap: false,
    minify: 'terser',
  },
  define: {
    'process.env.NODE_ENV': command === 'serve' ? '"development"' : '"production"'
  },
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}));
