#!/usr/bin/env node
const PrettyError = require('pretty-error')
new PrettyError().start()
require('./packages/noodl-cli/bin/cli.js')
