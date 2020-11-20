import _ from 'lodash'
import sinon from 'sinon'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import Logger, { _color } from 'logsnap'
import { noodlui } from './utils/test-utils'

chai.use(chaiAsPromised)

let logSpy: sinon.SinonStub

before(async () => {
  noodlui.init()
  console.clear()
  Logger.disable()
  try {
    logSpy = sinon.stub(global.console, 'log').callsFake(() => _.noop)
  } catch (error) {}
})

after(() => {
  logSpy?.restore?.()
})

afterEach(() => {
  document.body.textContent = ''
  noodlui.cleanup()
})
