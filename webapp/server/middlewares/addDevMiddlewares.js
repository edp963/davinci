const path = require('path')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const proxy = require('http-proxy-middleware')

const fs = require('fs')

function createWebpackMiddleware(compiler, publicPath) {
  return webpackDevMiddleware(compiler, {
    logLevel: 'warn',
    publicPath,
    silent: true,
    stats: 'errors-only'
  })
}

module.exports = function addDevMiddlewares(app, webpackConfig) {
  const compiler = webpack(webpackConfig)
  const middleware = createWebpackMiddleware(
    compiler,
    webpackConfig.output.publicPath
  )

  let proxyTarget = 'http://localhost:8080/'
  const configFilePath = path.resolve(__dirname, '../config.json')

  if (fs.existsSync(configFilePath)) {
    const jsonConfig = fs.readFileSync(configFilePath)
    const { proxies } = JSON.parse(jsonConfig)
    proxyTarget = proxies.find((proxy) => proxy.enabled).target
  } else {
    fs.writeFileSync(configFilePath, JSON.stringify({ proxies: [{ target: proxyTarget, enabled: true }] }))
  }

  app.use(['/api/v3', '/image'], proxy({ target: proxyTarget, changeOrigin: true }))
  app.use(middleware)
  app.use(webpackHotMiddleware(compiler))

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fsMemory = middleware.fileSystem

  app.get('*', (req, res) => {
    fsMemory.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404)
      } else {
        res.send(file.toString())
      }
    })
  })
}
