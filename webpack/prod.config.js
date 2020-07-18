
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  // webpack 4.x 默认使用的 uglyJsPlugin 进行压缩效率较低，可以使用 terser 进行优化
  mode: 'production',

  plugins: [
    // 每次打包前清除dist
    new CleanWebpackPlugin(),
    // 分离css文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[id].[contenthash].css'
    })
  ]
}