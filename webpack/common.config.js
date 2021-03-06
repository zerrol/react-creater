const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HappyPack = require("happypack");
const TsCheckerPlugin = require("fork-ts-checker-webpack-plugin");

const INDEX_ENTRY = path.resolve(__dirname, "../src/index.tsx");
const MOCK_ENTRY = path.resolve(__dirname, "../mock/index.ts");
const MODULES = path.resolve(__dirname, "../node_modules");
const SRC = path.resolve(__dirname, "../src");
const TEMPLATES = path.resolve(__dirname, "../public/index.html");

const getCssConfig = ({ enableCssModule } = {enableCssModule: false}) => ({
  test: enableCssModule
    ? /\.module\.less|\.module\.css$/
    : new RegExp(`^(?!.*\\.module).*\\.(less|css)`),
  enforce: "pre",
  include: [SRC, /node_modules.*antd/],
  use: [
    // prod需要拆分loader，这里无法通过merge进行自动合并
    process.env.NODE_ENV === "production"
      ? MiniCssExtractPlugin.loader
      : "style-loader",
    {
      loader: "css-loader",
      options: {
        modules: enableCssModule,
      },
    },
    // "postcss-loader",
    {
      loader: "less-loader", // compiles Less to CSS
      options: {
        // 如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
        javascriptEnabled: true,
      },
    },

    // happypack 不支持minicss所以需要分开写
    // 'happypack/loader?id=less'
  ],
});

module.exports = {
  entry: {
    // 主入口
    main: INDEX_ENTRY,
    // mock可以做为另一个入口
    // mock: MOCK_ENTRY
  },

  output: {
    filename: "js/[name]_[hash:8].bundle.js",
    // todo chunkFileName 按需加載
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@api": path.join(__dirname, "../src/api"),
      "@assets": path.join(__dirname, "../src/assets"),
      "@routes": path.join(__dirname, "../src/routes")
    },
  },

  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        exclude: MODULES,
        use: "happypack/loader?id=babel",
      },
      getCssConfig(),
      getCssConfig({
        enableCssModule: true,
      }),
      {
        test: /\.(jpe?g|png|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10 * 1024,
            name: "images/[name]__[hash:base64:5].[ext]",
          },
        },
        exclude: MODULES,
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          { loader: "file-loader?name=font/[name]__[hash:base64:5].[ext]" },
        ],
        exclude: MODULES,
      },
    ],
  },

  optimization: {
    // 自动拆分node_modules代码
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: "single",
  },

  plugins: [
    // 多线程打包
    new HappyPack({
      id: "babel",
      loaders: ["babel-loader?cacheDirectory"],
    }),
    // css
    // new HappyPack({
    //   id: 'sass',
    //   loaders: [
    //     'css-modules-typescript-loader',
    //     {
    //       loader: 'css-loader',
    //       options: {
    //         modules: true,
    //         localIdentName: '[local]__[path]__[hash:base64:5]]'
    //       },
    //     },
    //     'postcss-loader',
    //     'sass-loader'
    //   ]
    // }),
    new TsCheckerPlugin(),
    // 生成html模板
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: TEMPLATES,
      hash: true,
    }),
  ],
};
