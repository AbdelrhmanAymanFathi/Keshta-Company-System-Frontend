// const webpack = require('webpack');

// module.exports = {
  
//   lintOnSave: false,       //  عامله مشكله
//   configureWebpack: {
//     plugins: [
//       new webpack.ProgressPlugin()
//     ]
//   }
// }

// new code:
const webpack = require('webpack');

module.exports = {
  lintOnSave: false,

  devServer: {
    host: '0.0.0.0',   // يخلي السيرفر يسمع من بره
    port: 8080,

    client: {
      webSocketURL: 'ws://38.242.152.149:8080/ws'
    },

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        ws: true
      }
    }
  },

  configureWebpack: {
    plugins: [
      new webpack.ProgressPlugin()
    ]
  }
};
