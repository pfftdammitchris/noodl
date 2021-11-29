process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as n from 'noodl'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import fs from 'fs-extra'
import path from 'path'
import y, {
  isCollection,
  isDocument,
  isScalar,
  isPair,
  isMap,
  isSeq,
  parseDocument,
  visit,
} from 'yaml'

/**
 * @typedef { import('yaml').Node } YAMLNode
 * @typedef { import('yaml').YAMLMap } YAMLMap
 * @typedef { import('yaml').YAMLSeq } YAMLSeq
 * @typedef { import('yaml').Document } YAMLDocument
 */

const is = nt.Identify

/** @return { o is YAMLMap | YAMLSeq | YAMLDocument } */
const isGetAble = (o) => isCollection(o) || isDocument(o)
const loader = new n.Loader({ config: 'meetd2', loglevel: 'debug' })

;(async () => {
  try {
    await loader.init({ dir: n.getAbsFilePath('generated/meetd2') })
    const pathToYmlFile = n.getAbsFilePath('generated/Abc.yml')
    const yml = fs.readFileSync(pathToYmlFile, 'utf8')
    const doc = parseDocument(yml)
    const name = 'Abc'

    // for (const [name, doc] of loader.root) {
    visit(doc, {
      Pair: (key, node) => {
        if (isScalar(key)) {
          if (u.isStr(key.value)) {
            if (is.reference(key.value)) {
              const ref = key.value
              const trimmedRef = nu.trimReference(ref)
              if (is.localReference(ref)) {
              } else {
                //
              }
            }
          }
        }
      },
    })
    // }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
})()
