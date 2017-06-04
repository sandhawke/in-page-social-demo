'use strict'

const home_site = require('./home_site')
const away_site = require('./away_site')

// needs to be the same object because they update it
const config = {}
// they'll use ports from this list until it runs out, then use
// dynamically assigned ports
config.ports = [8098, 8099, 8100, 8101]

config.home_sites = []
config.away_sites = []

home_site(config)
home_site(config)

away_site(config)
away_site(config)
