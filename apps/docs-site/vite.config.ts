import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@acme/platform': path.resolve(__dirname, '../../packages/platform/src/index.ts'),
      '@acme/theme-engine': path.resolve(__dirname, '../../packages/theme-engine/src/index.ts'),
      '@acme/ui-presets': path.resolve(__dirname, '../../packages/ui-presets/src/index.ts')
    }
  }
})
