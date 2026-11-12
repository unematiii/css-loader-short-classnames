const path = require("path");
const { getNativeCssLocalIdentName } = require("../../..");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./entry.js",
  devtool: false,
  experiments: { css: true },
  output: {
    path: path.join(__dirname, ".output/native"),
    filename: "bundle.js",
    cssFilename: "bundle.css",
  },
  module: {
    generator: {
      "css/auto": { localIdentName: getNativeCssLocalIdentName() },
    },
  },
};
