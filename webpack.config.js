const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin') // html模版
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // 压缩 css 并合并成 文件
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin') // 压缩css & 去除注释  
const { CleanWebpackPlugin } = require('clean-webpack-plugin') // 删除 旧的文件 
const safeParser = require('postcss-safe-parser') // 添加前缀的规则

module.exports = (env, argv) => {
  const { 
    mode,  // 通过 mode 判断 开发 和 生产
  } = argv

  const isDEV = mode === 'development'

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      chunkFilename: isDEV ? '[name].chunk.js' : '[name].[contenthash].js',
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          common: {
            test: /[\\/]node_modules[\\/] || src\//,
            chunks: 'all',
            name: 'common',
            minSize: 0,
            minChunks: 2,
            enforce: true,
          },
        },
      },
      minimizer: isDEV ? [] : [
        new TerserPlugin(),
        new OptimizeCSSAssetsPlugin({
          assetNameRegExp: /\.css$/g,
          cssProcessorOptions: {
            parser: safeParser,
            discardComments: {
              removeAll: true,
            },
          },
        }),
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', 'css'],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_module/,
          use: ['babel-loader?cacheDirectory'],
        },
        {
          test: /\.css$/,
          use: [
            isDEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader', 
            { 
              loader: 'postcss-loader',
              options: {
                plugins: loader => [
                  require('autoprefixer')(), //CSS浏览器兼容
                ]
              }
            }
          ], // 注意排列顺序，执行顺序与排列顺序相反
          include: [path.resolve(__dirname, 'src')],
          exclude: /node_modules/,
        },
        {
          test: /\.styl$/,
          use: [
            isDEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            { 
              loader: 'postcss-loader',
              options: {
                plugins: loader => [
                  require('autoprefixer')(), //CSS浏览器兼容
                ]
              }
            },
            'stylus-loader',
          ],
          include: [path.resolve(__dirname, 'src')],
          exclude: /node_modules/,
        }, 
        {
          test: /\.(jpg|jpeg|png|gif|svg)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 1024 * 8, // 8k以下的base64内联，不产生图片文件
              fallback: 'file-loader', // 8k以上，用file-loader抽离（非必须，默认就是file-loader）
              name: '[name].[ext]?[hash]', // 文件名规则，默认是[hash].[ext]
              outputPath: 'images/', // 输出路径
              publicPath: ''  // 可访问到图片的引用路径(相对/绝对)
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './template/index.html',
      }),

      ...(isDEV ? 
        []
        : [
          new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [path.join(__dirname, 'dist')]
          }),
          new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].[contenthash].css',
          }),
        ]
      ),
    ]
  }
}
