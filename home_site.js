'use strict'

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
  let port = config.ports.shift() || 0
  const server = http.createServer(app)
  server.listen(port, () => {
    const a = server.address()
    port = a.port
    siteURL = 'http://' + os.hostname() + ':' + port
    config.home_sites.push(siteURL)
    console.log('Home site: ', siteURL)
  })

  router.use(logger('short'))
  router.use(express.static(path.join(__dirname, 'home_static'),
                            {extensions: ['html', 'css']}))
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/', router)

  // send the current state as a Server-Sent-Events stream, just to make
  // the demo nicer.  This has nothing to do with what's being demonstrated.
  app.get('/state_sse', (req, res) => {
    let running = true
    req.on('end', () => {
      running = false
    })
    let prev = ''
    res.setHeader('Content-Type', 'text/event-stream')
    res.flushHeaders()
    function f () {
      const statestr = JSON.stringify(state)
      if (statestr !== prev) {
        res.write('data: ' + statestr + '\n\n')
        //console.log('sse', statestr)
        prev = statestr
      }
      if (running) setTimeout(f, 10)
    }
    f()
  })
  
  app.get('/handle', (req, res) => {
    const parsed = url.parse(req.query.uri, true)
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
    //console.log('op, item', op, item, req.body)
    if (!state[op]) state[op] = {}
    state[op][item] = ! state[op][item]
    iframe(op, item, res)
  })

  function iframe(op, item, res) {
    //console.log('op ==', op)
    if (!state[op]) state[op] = {}
    const value = state[op][item]
    
    const text =
`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>inner iframe</title>
<link rel="stylesheet" type="text/css" href="/style.css" />
</head>
<body>
<p>Hi, this is <a href="${siteURL}" target="_blank">your home server</a> here, inside an iframe.</p>
<p>The parent page wants to let you toggle whether you <b>${op}</b> the item <b>${item}<p>
<form action="/toggle" method="post">
<input type="hidden" name="op" value="${op}">
<input type="hidden" name="item" value="${item}">
<p>Currently: <b>${value}</b>   <button>toggle</button>
</form>
</body>
</html>
`
res.send(text)
}

app.get('/', (req, res) => {
  const title = 'Demo on port ' + port
  const text =
`<!doctype html>
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

// To make a nicer demo, display the server's state continually:  
var source = new EventSource('/state_sse')
source.addEventListener('message', (e) => {
  var data = JSON.parse(e.data);
  document.getElementById('out').innerHTML='Current state on the server is:<br/><br/>'+JSON.stringify(data,null,2)
}, false);
</script>
</head>
<body>
<p>When you first visit this page, your browser should offer to register a protocol handler.  Chrome just makes a little diamond in the URL bar, with the hover text 'This page wants to install a service handle'.  Firefox makes it more obvious.</p>
<p>When done, open <a href="${config.away_sites[0]}" target="_blank">an "away" site</a> to try it out.</p>
<pre><div id='out'>
Refresh this page to see the home site state.  Currently:

${JSON.stringify(state,null,2)}
</div></pre>
</body>
</html>
`
  res.send(text)
})

}

module.exports = init
