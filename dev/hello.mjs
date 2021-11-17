import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import { getAbsFilePath, loadFile, Visitor } from 'noodl'
import fs from 'fs-extra'
import path from 'path'
import flowRight from 'lodash/flowRight.js'
import yaml from 'yaml'

const doc = loadFile(getAbsFilePath('generated/meetd2/SignIn.yml'), 'doc')

// const loader = new Loader({
//   config: 'meetd2',
//   deviceType: 'web',
//   dataType: 'object',
//   env: 'test',
//   version: 'latest',
//   loglevel: 'info',
// })

// await loader.init({
//   dir: 'generated/meetd2',
//   spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
// })

const store = {}
const root = {}
let c = 0

const visit = Visitor(store, root, (args) => {
  if (yaml.isScalar(args.node)) {
    c++
    if (u.isStr(args.node.value)) {
      if (nt.Identify.reference(args.node.value)) {
        console.log(args.node.value)
        return yaml.visit.SKIP
      }
    }
  }
})

visit('SignIn', doc)
