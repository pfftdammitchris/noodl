import _ from 'lodash'
import sinon from 'sinon'
import Logger from 'logsnap'
import { Resolver, Viewport } from 'noodl-ui'
import {
  assetsUrl,
  noodlui,
  noodluidom,
  getAllResolvers,
  viewport,
} from './test-utils'
import { listen } from '../../../src/handlers/dom'
import createBuiltInActions from '../../../src/handlers/builtIns'
import Page from '../../../src/Page'

const pageClient = new Page({ _log: false })
const builtIns = createBuiltInActions({ page: pageClient })

let logSpy: sinon.SinonStub

const page = 'GeneralInfo'
const root = {
  GeneralInfo: {
    Radio: [{ key: 'Gender', value: '' }],
  },
}

before(() => {
  console.clear()
  // Logger.disable()

  noodlui
    .init({ _log: false, viewport })
    .setPage(page)
    .use({})
    .use({
      getAssetsUrl: () => assetsUrl,
      getRoot: () => root,
    })
    .use(
      // @ts-expect-error
      _.map(_.entries({ redraw: builtIns.redraw }), ([funcName, fn]) => ({
        funcName,
        fn,
      })),
    )

  // logSpy = sinon.stub(global.console, 'log').callsFake(() => _.noop)

  try {
    Object.defineProperty(noodlui, 'cleanup', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function _cleanup() {
        noodlui.reset({ keepCallbacks: true }).setPage(page)
      },
    })
  } catch (error) {
    throw new Error(error)
  }
  _.forEach(getAllResolvers(), (r) => {
    const resolver = new Resolver()
    resolver.setResolver(r)
    noodlui.use(resolver as Resolver)
  })
})

after(() => {
  // logSpy.restore()
})

beforeEach(() => {
  listen(noodluidom)
  // noodlui.init({ _log: false, viewport })
  noodlui.setPage(page)
})

afterEach(() => {
  document.body.textContent = ''
  // @ts-expect-error
  noodlui.cleanup()
  noodluidom.removeAllCbs()
})
