const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(__dirname, "examples/src/index.html"),
  filename: "./index.html",
});

module.exports = {
  entry: path.join(__dirname, "examples/src/index.ts"),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        // 缓存公共文件
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        // 缓存公共文件
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [htmlWebpackPlugin],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    port: 7777,
    hot: true,
  },
};
