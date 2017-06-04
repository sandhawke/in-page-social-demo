
const http = require('http')
const os = require('os')
const url = require('url')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')

function init (config) {
  const state = {}
  const app = express()
  const router = express.Router()

  let siteURL
  let port
  const server = http.createServer(app)
  server.listen(8099, () => {
    const a = server.address()
    port = a.port
    siteURL = 'http://' + os.hostname() + ':' + a.port
    config.handler_site = siteURL
    console.log('Set up handler using: ', siteURL)
  })

  router.use(logger('tiny'))
  router.use(express.static(path.join(__dirname, 'handler_static'),
                            {extensions: ['html', 'css']}))
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/', router)

  
  app.get('/handle', (req, res) => {
    const parsed = url.parse(req.query.uri, true)
    // const [prefix, op, q, ...rest] = req.query.uri.split(/[:?]/)
    console.log('PARSED', parsed)
    if (parsed.protocol !== 'web+inpagesocial:') {
      console.log('unknown protocol', parsed.protocol)
      res.status(404).end()
      return
    }
    const op = parsed.hostname
    const item = parsed.query.item

    iframe(op, item, res)
  })

  app.post('/toggle', (req, res) => {
    const op = req.body.op
    const item = req.body.item
    console.log('op, item', op, item, req.body)
    if (!state[op]) state[op] = {}
    state[op][item] = ! state[op][item]
    iframe(op, item, res)
  })

  function iframe(op, item, res) {
    console.log('op ==', op)
    if (!state[op]) state[op] = {}
    const value = state[op][item]
    
    const text = `<!doctype html>
          <html lang="en">
          <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>inner iframe</title>
          <link rel="stylesheet" type="text/css" href="/style.css" />
          </head>
      <body>
      <p>Hi, this is <a href="${siteURL}" target="_blank">your home server</a> here, inside an iframe.</p>
      <p>The page wants to let you toggle whether you <b>${op}</b> the item <b>${item}<p>
      <form action="/toggle" method="post">
      <input type="hidden" name="op" value="${op}">
      <input type="hidden" name="item" value="${item}">
      <p>Currently: <b>${value}</b>   <button>toggle</button>
      </form>
</body>
</html>
`
// put these back in if we need them for something...
//  <div id="out">JavaScript isn't working, sorry.</div>
//  <script type="text/javascript" src="/iframe-script.js"></script>

res.send(text)
}

app.get('/', (req, res) => {
title = 'Demo on port ' + port
const text = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link rel="stylesheet" type="text/css" href="/style.css" />
<script type="text/javascript" >
navigator.registerProtocolHandler("web+inpagesocial",
"${siteURL}/handle?uri=%s",
"Inpage Social");
</script>
</head>
<body>
<p>When you first visit this page, your browser should offer to register a protocol handler.</p>
<p>When that's done, open <a href="${config.usage_site}" target="_blank">away site</a> to try it out.</p>
<p>Refresh this page to see the home site state.  Currently:</p>
<pre>${JSON.stringify(state,null,2)}</pre>
</body>
</html>
`
    res.send(text)
  })

  app.post('/', (req, res) => {
    res.send('POST request to the homepage')
  })
}

module.exports = init
