import * as u from '@jsmanifest/utils'
import yaml from 'yaml'
import Aggregator from 'noodl-aggregator'
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
    console.error(error)
  }
})()
