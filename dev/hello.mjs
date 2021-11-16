import * as u from '@jsmanifest/utils'
import { Loader } from 'noodl'
import flowRight from 'lodash/flowRight.js'
import yaml from 'yaml'
import tsn from 'ts-node'

const repl = tsn.createRepl()
const service = tsn.create({ ...repl.evalAwarePartialHost })
repl.setService(service)
repl.start()

repl.evalCode(String(yaml.parse()))

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
