import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@acme/platform': path.resolve(__dirname, '../../packages/platform/src/index.ts'),
      '@acme/theme-engine': path.resolve(__dirname, '../../packages/theme-engine/src/index.ts'),
      '@acme/icon-packs': path.resolve(__dirname, '../../packages/icon-packs/src/index.ts'),
      '@acme/icon-packs/legacy': path.resolve(__dirname, '../../packages/icon-packs/src/legacy.ts'),
      '@acme/layout-engine': path.resolve(__dirname, '../../packages/layout-engine/src/index.ts'),
      '@acme/motion-engine': path.resolve(__dirname, '../../packages/motion-engine/src/index.ts'),
      '@acme/theme-ai': path.resolve(__dirname, '../../packages/theme-ai/src/index.ts'),
      '@acme/ui-presets': path.resolve(__dirname, '../../packages/ui-presets/src/index.ts')
    }
  }
})
