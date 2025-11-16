const webpack = require('webpack');

module.exports = {
  
  lintOnSave: false,       //  عامله مشكله
  configureWebpack: {
    plugins: [
      new webpack.ProgressPlugin()
    ]
  }
}
