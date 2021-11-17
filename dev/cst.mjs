import * as u from '@jsmanifest/utils'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'

const { isScalar, isPair, isMap, isSeq, isNode } = yaml

const pathToYmlFile = path.resolve(
  path.join(process.cwd(), 'data/meetd2/SignIn_en.yml'),
)
const yml = await fs.readFile(pathToYmlFile, 'utf8')

const builtIns = {
  id: [],
  values: [],
}

/**
 * @param { import('yaml').Node | string | undefined | null } node
 * @returns { string }
 */
function toPrimitive(node) {
  if (!node) return node
  if (isScalar(node)) return node.toJSON()
  if (isPair(node)) return { key: node.key, value: toPrimitive(node.value) }
  if (isMap(node)) return node.toJSON()
  if (isSeq(node)) return node.toJSON()
  return u.isStr(node)
    ? node
    : u.isObj(node)
    ? JSON.stringify(node, null, 2)
    : node
}

yaml.visit(yaml.parseDocument(yml), {
  Scalar: (key, node, path) => {
    //
  },
  Pair: (key, node, path) => {
    if (isScalar(node.key) && u.isStr(node.key.value)) {
      const key = node.key.value
      if (key.startsWith('=.builtIn.')) {
        if (!builtIns.id.includes(key)) {
          builtIns.id.push(key)
        }
        builtIns.values.push({
          key,
          value: toPrimitive(node.value),
        })
      }
    }
  },
  Map: (key, node, path) => {
    //
  },
  Seq: (key, node, path) => {
    //
  },
})

console.dir(builtIns, {
  compact: false,
  depth: Infinity,
  getters: true,
  showHidden: true,
})
