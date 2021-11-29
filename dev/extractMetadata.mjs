import { Loader } from 'noodl'
import prettier from 'prettier'
import flowRight from 'lodash/flowRight.js'
import yaml from 'yaml'
import { extract } from 'noodl-metadata'
import fs from 'fs-extra'
import path from 'path'
import * as nt from 'noodl-types'
import * as ts from 'ts-morph'
import * as u from '@jsmanifest/utils'
import * as metadataUtils from './utils.mjs'
import * as metadataFns from './metadataFns.mjs'

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
    const { tsProject } = await extract({
      config: 'meetd2',
      logLevel: 'debug',
      loader: {
        init: {
          dir: './generated/meetd2',
          spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
        },
      },
      fns: [metadataFns.extractActions],
    })

    await tsProject.save()
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error(String(error))
  }
})()
