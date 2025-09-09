import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Configurações para resolver problemas de build
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: [],
      output: {
        manualChunks: undefined,
      },
    },
    // Aumentar limite de chunk se necessário
    chunkSizeWarningLimit: 1000,
    // Otimização
    minify: 'terser',
    sourcemap: false,
  },
  // Configuração para desenvolvimento
  server: {
    port: 3000,
    open: true,
  },
  // Otimização de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js'
    ],
  },
})
