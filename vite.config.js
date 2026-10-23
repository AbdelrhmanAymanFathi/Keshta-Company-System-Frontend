import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const packagesDir = fileURLToPath(new URL('./packages', import.meta.url))

/** Directory aliases — Vite resolves index.ts via resolve.extensions */
const acmeAliases = {
  '@acme/platform': `${packagesDir}/platform/src`,
  '@acme/theme-engine': `${packagesDir}/theme-engine/src`,
  '@acme/icon-packs': `${packagesDir}/icon-packs/src`,
  '@acme/icon-packs/legacy': `${packagesDir}/icon-packs/src/legacy.ts`,
  '@acme/layout-engine': `${packagesDir}/layout-engine/src`,
  '@acme/motion-engine': `${packagesDir}/motion-engine/src`,
  '@acme/theme-ai': `${packagesDir}/theme-ai/src`,
  '@acme/ui-presets': `${packagesDir}/ui-presets/src`
}

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      ...acmeAliases
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
  },

  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: [
      'keshta.collaga.app',
      '89.116.29.238',
      '38.242.152.149',
      '127.0.0.1',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws: true
      }
    }
  },

  build: {
    // Never ship source maps to production (they leaked full source in dist/).
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('apexcharts') || id.includes('vue3-apexcharts')) return 'charts'
            if (id.includes('jspdf')) return 'jspdf'
            if (id.includes('xlsx')) return 'xlsx'
            if (id.includes('@tanstack')) return 'query'
            if (id.includes('vue-router') || id.includes('pinia') || id.includes('vue-i18n')) return 'vue-core'
            return 'vendor'
          }
        }
      }
    }
  }
})
