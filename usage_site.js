
const http = require('http')
const os = require('os')
const url = require('url')
const path = require('path')
const express = require('express')
const logger = require('morgan')

function init (config) {
  const app = express()
  const router = express.Router()

  let siteURL
  let port
  const server = http.createServer(app)
  server.listen(0, () => {
    const a = server.address()
    port = a.port
    siteURL = 'http://' + os.hostname() + ':' + a.port
    config.usage_site = siteURL
    console.log('Try to use it via: ', siteURL)
  })

  router.use(logger('tiny'))
  router.use(express.static(path.join(__dirname, 'usage_static'),
                            {extensions: ['html', 'css']}))
  app.use('/', router)
}

module.exports = init
