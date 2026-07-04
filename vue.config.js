const path = require('path')

const packagesDir = path.resolve(__dirname, 'packages')

/** Directory aliases — webpack resolves index.ts via mainFiles */
const acmeAliases = {
  '@acme/platform': path.join(packagesDir, 'platform/src'),
  '@acme/theme-engine': path.join(packagesDir, 'theme-engine/src'),
  '@acme/icon-packs': path.join(packagesDir, 'icon-packs/src'),
  '@acme/icon-packs/legacy': path.join(packagesDir, 'icon-packs/src/legacy.ts'),
  '@acme/layout-engine': path.join(packagesDir, 'layout-engine/src'),
  '@acme/motion-engine': path.join(packagesDir, 'motion-engine/src'),
  '@acme/theme-ai': path.join(packagesDir, 'theme-ai/src'),
  '@acme/ui-presets': path.join(packagesDir, 'ui-presets/src')
}

const webpack = require('webpack')
const BaseIP = process.env.VUE_APP_PUBLIC_IP

module.exports = {
  lintOnSave: false,

  devServer: {
    host: '0.0.0.0',
    port: 8080,
    client: {
      webSocketURL: `ws://${BaseIP}:8080/ws`
    },
    allowedHosts: [
      'keshta.collaga.app',
      '89.116.29.238',
      '38.242.152.149',
      '127.0.0.1',
      'localhost',
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        ws: true
      }
    }
  },

  // Transpile all linked workspace packages (symlinks in node_modules)
  transpileDependencies: true,

  configureWebpack: {
    resolve: {
      alias: acmeAliases,
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
      mainFiles: ['index.ts', 'index.js']
    },
    plugins: [new webpack.ProgressPlugin()]
  },

  chainWebpack(config) {
    // Transpile every .ts file under packages/ with Babel + TS preset
    config.module
      .rule('acme-typescript')
      .test(/\.ts$/)
      .include.add(packagesDir)
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        presets: [
          '@vue/cli-plugin-babel/preset',
          ['@babel/preset-typescript', { onlyRemoveTypeImports: true, allowDeclareFields: true }]
        ],
        cacheDirectory: true
      })
      .end()
      .before('js')

    // When packages import each other via @acme/* aliases, ensure those paths are included
    config.module
      .rule('js')
      .include.add(packagesDir)
  }
}
