import * as u from '@jsmanifest/utils'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import express from 'express'
import fs from 'fs-extra'
import path from 'path'

const app = express()
const port = 8080
const tag = (s = '') => `[${u.cyan(s)}]`
const log = console.log

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

// CORS
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization',
  )
  next()
})

app.get('ref', function (req, res, next) {
  res.send(JSON.stringify({ hello: 'hi' }, null, 2))
})

const server = app.listen(port, () => {
  log(
    `${tag(`listening`)} Server is now listening on port ${u.cyan(
      String(port),
    )}`,
  )
})

server.addListener('connect', (req, socket) => {
  log(`${tag('connect')}`)
})

server.addListener('close', () => {
  log(`${tag('close')} Server closed`)
})

server.addListener('listening', () => {
  log(`${tag('listening')} Server is now listening`)
})

server.addListener('error', (err) => {
  log(`[${u.yellow(err.name)}] ${u.red(err.message)}`)
})

server.addListener('request', (req, res) => {
  log(`${tag('request')} Received a request`)
})

server.addListener('clientError', (err) => {
  log(`${tag('clientError')}`, err)
})
