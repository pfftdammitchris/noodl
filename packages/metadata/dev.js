// const u = require('@jsmanifest/utils')
// const yaml = require('yaml')
// const axios = require('axios')
// const fs = require('fs-extra')
// const path = require('path')
import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
;(async () => {
  try {
    const resp = await axios.post(
      `http://127.0.0.1:3001/.netlify/functions/metadata`,
      {},
    )
    console.log(resp.data)
  } catch (error) {
    console.error(`[${u.yellow(error.name)}] ${u.red(error.message)}`, error)
  }
})()
