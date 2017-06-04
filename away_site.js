'use strict'

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
  let port = config.ports.shift() || 0
  const server = http.createServer(app)
  server.listen(0, () => {
    const a = server.address()
    port = a.port
    siteURL = 'http://' + os.hostname() + ':' + a.port
    config.away_sites.push(siteURL)
    console.log('Away site: ', siteURL)
  })

  router.use(logger('short'))
  router.use(express.static(path.join(__dirname, 'away_static'),
                            {extensions: ['html', 'css']}))
  app.use('/', router)
}

module.exports = init
