'use strict'

const handler_site = require('./handler_site')
const usage_site = require('./usage_site')

const config = {}  // needs to be the same object because they update it
handler_site(config)
usage_site(config)
