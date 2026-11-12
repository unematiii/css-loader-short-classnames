const path = require("path");
const { getLocalIdentName } = require("../../..");

module.exports = {
  mode: "development",
  context: __dirname,
  entry: "./entry.js",
  devtool: false,
  output: {
    path: path.join(__dirname, ".output/loader"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.module\.css$/i,
        use: [
          {
            loader: require.resolve("css-loader"),
            options: {
              modules: {
                namedExport: false,
                getLocalIdent: getLocalIdentName(),
              },
            },
          },
        ],
      },
    ],
  },
};
