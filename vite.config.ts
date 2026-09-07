import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'spa',
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // Multiple passes for better compression/mangling
        booleans_as_integers: true, // Obfuscates booleans
        toplevel: true, // Mangle top level variable names
      },
      mangle: {
        toplevel: true, // Mangle all variable and function names
        properties: {
          regex: /^_/ // Mangle object properties starting with underscore
        }
      },
      format: {
        comments: false, // Drop all comments
      }
    },
    rollupOptions: {
      output: {
        // Obfuscate chunk names
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash][extname]'
      }
    }
  }
});
