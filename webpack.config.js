const path = require('path');

module.exports = {
  mode: 'production',
  entry: './Scripts/inject/inject.js',
  output: {
    filename: 'inject.bundle.js',
    path: path.resolve(__dirname, 'Scripts/inject'),
  },
  optimization: {
    minimize: false
  }
};
