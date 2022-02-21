const axios = require('axios').default
const u = require('@jsmanifest/utils')
const fs = require('fs-extra')
const path = require('path')
const cheerio = require('cheerio').default

/**
 * @param { function } cb
 * @param { import('cheerio')['default']['root'] } $
 * @param { import('cheerio').Cheerio } $el
 */
function traverse(cb, $, $el) {
  const sibs = $el.nextAll()

  for (const sib of sibs) {
    cb($child, $el, $)

    for (const child of sib.children) {
      const $child = $(child)
      cb($child, $el, $)
      traverse(cb, $, $child)
    }
  }
}

function validateHtml(html = '') {
  const $ = cheerio.load(html)
  const validators = {
    attr: {},
    text: [],
  }
}

;(async () => {
  try {
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error(`[${u.yellow(err.name)}]: ${u.red(err.message)}`)
    throw err
  }
})()
