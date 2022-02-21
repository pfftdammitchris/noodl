import noodl from 'noodl'
import prettier from 'prettier'
import flowRight from 'lodash/flowRight.js'
import yaml from 'yaml'
import { extract } from 'noodl-metadata'
import fs from 'fs-extra'
import path from 'path'
import * as nt from 'noodl-types'
import * as tsm from 'ts-morph'
import * as u from '@jsmanifest/utils'
import * as metadataUtils from './utils.mjs'
import * as metadataFns from './metadataFns.mjs'

const { Loader } = noodl
const {
  isScalar,
  isPair,
  isMap,
  isSeq,
  Node: YAMLNode,
  Document: YAMLDocument,
  YAMLMap,
  YAMLSeq,
  Pair,
  Scalar,
  visit,
} = yaml

;(async () => {
  try {
    const loader = new Loader()
    loader.configKey = 'wwv'
    const r = await loader.init({
      spread: ['BasePage', 'BaseDataModel', 'BaseCSS', 'Resource'],
      loadPages: true,
      loadPreloadPages: true,
    })

    console.log(loader)
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
})()
