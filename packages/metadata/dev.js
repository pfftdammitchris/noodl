const u = require('@jsmanifest/utils')
const yaml = require('yaml')
const axios = require('axios').default
const fs = require('fs-extra')
const path = require('path')

//
;(async () => {
  try {
    const resp = await axios.get(
      `http://127.0.0.1:3000/.netlify/functions/metadata`,
      {
        params: {
          config: 'admind2',
          actionTypes: true,
        },
      },
    )
    console.log(resp.data)
  } catch (error) {
    console.error(
      `[${u.yellow(error.name)}] ${u.red(error.message)}`,
      '\n' + error.stack.split('\n').slice(1).join('\n'),
    )
  }
})()
