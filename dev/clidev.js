const execa = require('execa')
const fs = require('fs-extra')
const path = require('path')
const { syncBuiltinESMExports } = require('module')

const output = require.prototype
syncBuiltinESMExports()
console.log(module.children)
