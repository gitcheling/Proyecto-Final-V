import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // AÑADIMOS ESTA SECCIÓN PARA RESOLVER EL ERROR DE IMPORTACIÓN DE CSS DE PRIMEVUE
  optimizeDeps: {
    include: [
      'primevue', // Incluye el módulo principal
    ]
  }
  
})
