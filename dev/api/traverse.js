const dotenv = require('dotenv')
dotenv.config({ path: 'packages/api/.env' })
dotenv.config({ path: '../env' })
const u = require('@jsmanifest/utils')
const fg = require('fast-glob')
const fs = require('fs-extra')
const path = require('path')
const y = require('yaml')
const n = require('noodl')
const nt = require('noodl-types')

/**
 * @typedef { (args: { key?: string; index?: number; value: any; path: Path; parent?: Record<string, any> }) => void } Callback
 * @typedef { (string | number)[] } Path
 */

/**
 * @param { Callback } callback
 * @param { any } obj
 * @param { Path } path
 * @param { any[] } ascendants
 */

function traverse(callback, obj, path = [], ascendants = []) {
  ascendants = [...ascendants]

  while (ascendants.length > 10) ascendants.shift()

  if ((y.isDocument(obj) && y.isMap(obj.contents)) || y.isMap(obj)) {
    /** @type { y.YAMLMap } */
    const map = y.isDocument(obj) ? obj.contents : obj
    ascendants.push(map)
    map.items.forEach((pair) => {
      const key = String(pair.key)
      const currPath = path.concat(key)
      callback({
        key,
        value: pair.value,
        parent: obj,
        path: currPath,
        ascendants,
      })
      traverse(callback, pair.value, currPath, ascendants)
    })
  } else if (y.isSeq(obj)) {
    ascendants.push(obj)
    obj.items.forEach((node, index) => {
      const currPath = path.concat(index)
      callback({ value: node, index, parent: obj, path: currPath, ascendants })
      traverse(callback, node, currPath, ascendants)
    })
  }
}

module.exports = traverse
