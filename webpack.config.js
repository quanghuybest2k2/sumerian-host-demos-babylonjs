const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "assets/**/*.*", context: "src/" },
        { from: "index.html", context: "src/" },
        { from: "html/**/*.html", context: "src/" },
        { from: "css/**/*.css", context: "src/" },
        { from: "css/**/*.png", context: "src/" },
      ],
    }),
  ],
  entry: {
    textToSpeech: {
      import: "./src/js/pages/textToSpeech.js",
    },
    speechToText: {
      import: "./src/js/pages/speechToText.js",
    },
  },
  resolve: {
    extensions: [".js"],
  },
  module: {},
  output: {
    clean: true,
  },
  devServer: {
    static: "./dist",
    liveReload: true,
    hot: true,
    open: "/",
    watchFiles: ["./src/index.html"],
  },
};
