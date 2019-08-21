/**
 * COMMON WEBPACK CONFIGURATION
 */

const os = require('os')
const path = require('path')
const webpack = require('webpack')
const HappyPack = require('happypack')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const overrideLessVariables = require('../../app/assets/override/lessVariables')

// Remove this line once the following warning goes away (it was meant for webpack loader authors not users):
// 'DeprecationWarning: loaderUtils.parseQuery() received a non-string value which can be problematic,
// see https://github.com/webpack/loader-utils/issues/56 parseQuery() will be replaced with getOptions()
// in the next major version of loader-utils.'
process.noDeprecation = true

module.exports = options => ({
  mode: options.mode,
  entry: options.entry,
  output: Object.assign(
    {
      // Compile into js/build.js
      path: path.resolve(process.cwd(), 'build'),
      publicPath: '/'
    },
    options.output
  ), // Merge with env dependent settings
  optimization: options.optimization,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'happypack/loader?id=typescript'
      },
      {
        test: /\.js$/, // Transform all .js files required somewhere with Babel
        exclude: /node_modules(?!\/quill-image-drop-module|quill-image-resize-module)/,
        use: 'happypack/loader?id=js'
      },
      {
        // Do not transform vendor's CSS with CSS-modules
        // The point is that they remain in global scope.
        // Since we require these CSS files in our JS or CSS files,
        // they will be a part of our compilation either way.
        // So, no need for ExtractTextPlugin here.
        test: /\.css$/,
        include: /node_modules|libs/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.css$/,
        include: [/app[\\\/]assets/],
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.less$/,
        include: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          `less-loader?{"sourceMap": true, "modifyVars": ${JSON.stringify(
            overrideLessVariables
          )}}`
        ]
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader?modules&importLoaders=1',
          'postcss-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: 'file-loader'
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              // Inline files smaller than 10 kB
              limit: 10 * 1024,
              noquotes: true
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // Inline files smaller than 10 kB
              limit: 10 * 1024
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                enabled: false
                // NOTE: mozjpeg is disabled as it causes errors in some Linux environments
                // Try enabling it in your environment by switching the config to:
                // enabled: true,
                // progressive: true,
              },
              gifsicle: {
                interlaced: false
              },
              optipng: {
                optimizationLevel: 7
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }
      }
    ]
  },
  plugins: options.plugins.concat([
    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; UglifyJS will automatically
    // drop any unreachable code.
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.ContextReplacementPlugin(/^\.\/locale$/, (context) => {
      if (!/\/moment\//.test(context.context)) return;

      Object.assign(context, {
          regExp: /^\.\/\w+/,
          request: '../../locale', // resolved relatively
      });
    }),
    new webpack.ProvidePlugin({
      'window.Quill': 'quill'
    }),
    new HappyPack({
      id: 'typescript',
      loaders: options.tsLoaders,
      threadPool: happyThreadPool,
      verbose: true
    }),
    new HappyPack({
      id: 'js',
      loaders: ['babel-loader'],
      threadPool: happyThreadPool,
      verbose: true
    })
  ]),
  resolve: {
    modules: ['node_modules', 'app'],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.react.js'],
    mainFields: ['browser', 'jsnext:main', 'main'],
    alias: {
      'react-dom': '@hot-loader/react-dom', // https://github.com/gaearon/react-hot-loader/issues/1227
      app: path.resolve(process.cwd(), 'app'),
      libs: path.resolve(process.cwd(), 'libs'),
      assets: path.resolve(process.cwd(), 'app/assets')
      // fonts: path.resolve(process.cwd(), 'app/assets/fonts')
    }
  },
  devtool: options.devtool,
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: options.performance || {}
})
