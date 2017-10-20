const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {app: path.resolve(__dirname, 'server/server')},
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [{
      test: /\.js?$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js'
  }
};