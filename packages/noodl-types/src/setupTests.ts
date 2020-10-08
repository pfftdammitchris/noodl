import _ from 'lodash'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import Logger, { _color } from 'logsnap'
import { noodluidom } from './utils/test-utils'

chai.use(chaiAsPromised)

let logSpy: sinon.SinonStub
let logsnapSpy: sinon.SinonStub

before(async () => {
  console.clear()
  // Silence all the logging from our custom logger
  // Logger.create = sinon.stub().callsFake(() =>
  //   _.reduce(
  //     _.keys(_color),
  //     (acc: any, color) => {
  //       acc[color] = _.noop
  //       return acc
  //     },
  //     {},
  //   ),
  // )
  try {
    logSpy = sinon.stub(global.console, 'log').callsFake(() => _.noop)
    logsnapSpy = sinon.stub(Logger, 'create').callsFake(() => _.noop)
  } catch (error) {}
})

after(() => {
  logSpy?.restore?.()
  logsnapSpy?.restore?.()
})

afterEach(() => {
  document.body.textContent = ''
  noodluidom.reset()
})
