const fs = require('fs-extra')
const path = require('path')
const yaml = require('yaml')

const ymlFile = fs.readFileSync('./server/AddContact.yml', 'utf8')
const ymlObj = yaml.parse(ymlFile)

console.log(ymlObj)
