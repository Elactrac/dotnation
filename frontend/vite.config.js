import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for large dependencies
          'polkadot-core': [
            '@polkadot/api',
            '@polkadot/api-contract',
            '@polkadot/util',
            '@polkadot/util-crypto',
          ],
          'polkadot-extension': [
            '@polkadot/extension-dapp',
          ],
          'animations': [
            'framer-motion',
          ],
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          'ui-libs': [
            'react-hot-toast',
            'react-icons',
            'lucide-react',
          ],
        },
      },
    },
    // Increase chunk size warning limit to avoid noise
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize for modern browsers
    target: 'es2015',
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@polkadot/api',
      '@polkadot/api-contract',
      'framer-motion',
    ],
    exclude: ['@polkadot/wasm-crypto'],
  },
})