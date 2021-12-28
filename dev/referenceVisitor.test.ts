import * as u from '@jsmanifest/utils'
import * as n from 'noodl'
import { Loader } from 'noodl'
import fs from 'fs-extra'
import Visitor from './referenceVisitor'
import y from 'yaml'

let loader: Loader
let visitor: Visitor

beforeEach(async () => {
  visitor = new Visitor()
  loader = new n.Loader({
    config: 'meetd2',
    loglevel: 'debug',
  })

  await loader.init({
    // dir: n.getAbsFilePath('generated/meetd2'),
    loadPages: true,
    loadPreloadPages: true,
    spread: ['BaseDataModel', 'BaseCSS', 'BasePage', 'BaseMessage'],
  })

  const pathToYmlFile = n.getAbsFilePath('generated/meetd2/Abc.yml')
  const yml = fs.readFileSync(pathToYmlFile, 'utf8')
  const data = new y.Document({}, { logLevel: 'debug', prettyErrors: true })

  loader.setInRoot('Abc', y.parseDocument(yml).get('Abc'))
})

describe(`Visitor`, () => {
  it(``, () => {
    const visitor = new Visitor()
    visitor.visit('Abc', loader.root.get('Abc'))
  })
})
