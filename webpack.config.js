const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
 template: path.join(__dirname, "examples/src/index.html"),
 filename: "./index.html"
});
console.log(__dirname, '__dirname',path.resolve(__dirname, './src/'))
module.exports = {
 entry: path.join(__dirname, "examples/src/index.js"),
 module: {
   rules: [{
     test: /\.(js|jsx)$/,
   use: "babel-loader",
   exclude: /node_modules/
 },
 {
   test: /\.css$/,
   use: ["style-loader", "css-loader"]
 }]
},
 plugins: [htmlWebpackPlugin],
 resolve: {
   alias: {
    '@': path.resolve(__dirname, 'src')
  },
   extensions: [".js", ".jsx"],
 },
 devServer: {
   port: 7777
},
};