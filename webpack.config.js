const path = require("path");

module.exports = {
  mode: "production",
  entry: "./Scripts/Injection/inject.js",
  output: {
    filename: "inject.bundle.js",
    path: path.resolve(__dirname, "Scripts/Injection"),
  },
  optimization: {
    minimize: false,
  },
};
