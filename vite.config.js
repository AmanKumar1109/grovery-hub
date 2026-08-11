import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: true,
    proxy: {
      '/sabpaisa-api-stag': {
        target: 'https://staging-sb-merchant-api.sabpaisa.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sabpaisa-api-stag/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
      '/sabpaisa-api-prod': {
        target: 'https://merchant-api.sabpaisa.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sabpaisa-api-prod/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },

    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('gsap')) {
              return 'animations';
            }
            if (id.includes('sabpaisa-pg-dev')) {
              return 'sabpaisa';
            }
            if (id.includes('react')) {
              return 'vendor';
            }
          }
        },
      },
    },
  },
});
