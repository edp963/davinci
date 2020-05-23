// Important modules this config uses
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { HashedModuleIdsPlugin } = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = require('./webpack.base.babel')({
  mode: 'production',

  // In production, we skip all hot-reloading stuff
  entry: {
    app: [
      require.resolve('react-app-polyfill/ie11'),
      path.join(process.cwd(), 'app/app.tsx')
    ],
    share: [
      require.resolve('react-app-polyfill/ie11'),
      path.join(process.cwd(), 'share/app.tsx')
    ]
  },

  // Utilize long-term caching by adding content hashes (not compilation hashes) to compiled assets
  output: {
    path: path.resolve(process.cwd(), '../davinci-ui'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js'
  },

  tsLoaders: [
    // {
    //   loader: 'awesome-typescript-loader',
    //   options: {
    //     useBabel: true,
    //     babelOptions: {
    //       babelrc: true
    //     },
    //     useCache: false
    //   }
    // }
    {
      loader: 'babel-loader'
    },
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true
      }
    }
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          warnings: false,
          compress: {
            comparisons: false
          },
          parse: {},
          mangle: true,
          output: {
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        cache: true,
        sourceMap: true
      })
    ],
    nodeEnv: 'production',
    sideEffects: true,
    concatenateModules: true,
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/](?!antd|jquery|three|bootstrap-datepicker)(.[a-zA-Z0-9.\-_]+)[\\/]/,
          // test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
        // main: {
        //   chunks: 'all',
        //   minChunks: 2,
        //   reuseExistingChunk: true,
        //   enforce: true
        // }
      }
    },
    runtimeChunk: true
  },

  plugins: [
    // Minify and optimize the index.html
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['app', 'runtime~app', 'app~share', 'vendor'],
      template: 'app/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'share.html',
      chunks: ['share', 'runtime~share', 'app~share', 'vendor'],
      template: 'app/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      inject: true
    }),

    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),

    new HashedModuleIdsPlugin({
      hashFunction: 'sha256',
      hashDigest: 'hex',
      hashDigestLength: 20
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: 'localhost',
      analyzerPort: 5000,
      reportFilename: 'report.html',
      defaultSizes: 'parsed',
      openAnalyzer: true,
      generateStatsFile: true,
      statsFilename: '../stats.json',
      statsOptions: null,
      logLevel: 'info'
    })
  ],

  performance: {
    assetFilter: assetFilename =>
      !/(\.map$)|(^(main\.|favicon\.))/.test(assetFilename)
  },

  htmlWebpackPlugin: {
    files: {
      js: ['app.js', 'share.js'],
      chunks: {
        app: {
          entry: 'app.js'
        },
        share: {
          entry: 'share.js'
        }
      }
    }
  }
})
