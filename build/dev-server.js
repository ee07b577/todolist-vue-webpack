require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) { // 如果命令行中没没有传入NODE_ENV参数，从配置文件中读取，值为“development”
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn') // A better node-open. Opens stuff like websites, files, executables. Cross-platform.
var path = require('path') // node.js原生路径处理
var express = require('express') // Fast, unopinionated, minimalist web framework for node.
var webpack = require('webpack') // 这个当然是webpack啦
var proxyMiddleware = require('http-proxy-middleware') // 代理。Node.js proxying made simple. Configure proxy middleware with ease for connect, express, browser-sync and many more.


// 根据NODE_ENV参数，判断webpackConfig文件采用哪一个. testing的话使用./webpack.prod.conf 配置
var webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('./webpack.prod.conf')
  : require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)


/* webpack-dev-middleware 介绍
It's a simple wrapper middleware for webpack. It serves the files emitted from webpack over a connect server. This should be used for development only.

It has a few advantages over bundling it as files:

* No files are written to disk, it handle the files in memory
* If files changed in watch mode, the middleware no longer serves the old bundle, but delays requests until the compiling has finished. You don't have to wait before refreshing the page after a file modification.
* I may add some specific optimization in future releases.
*/
var devMiddleware = require('webpack-dev-middleware')(compiler, {
  // public path to bind the middleware to
  // use the same as in webpack
  publicPath: webpackConfig.output.publicPath,
  // display nothing to the console ? true: yes false: no
  quiet: true

})

/* webpack-hot-middleware 介绍
Webpack hot reloading using only webpack-dev-middleware. This allows you to add hot reloading into an existing server without webpack-dev-server.

This module is only concerned with the mechanisms to connect a browser client to a webpack server & receive updates. It will subscribe to changes from the server and execute those changes using webpack's HMR API. Actually making your application capable of using hot reloading to make seamless changes is out of scope, and usually handled by another library.
*/
var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  // A function used to log lines, pass false to disable. Defaults to console.log
  log: () => {},
  // How often to send heartbeat updates to the client to keep the connection alive. Should be less than the client's timeout setting - usually set to half its value.
  heartbeat: 2000
})

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
// A tiny, accurate, fast Express middleware for single page apps with client side routing.
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
// posix 代表 “可移植操作系统接口” Portable Operation System Interface
// path.posix.join 表示以兼容posix的方式执行 path.join，遵循这个标准的好处是软件可以跨平台
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port


// todo : 这里没看懂
var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
