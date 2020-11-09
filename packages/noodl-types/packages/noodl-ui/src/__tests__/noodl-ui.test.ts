import _ from 'lodash'
import sinon from 'sinon'
import { expect } from 'chai'
import { IComponent, NOODLComponent, IComponentTypeInstance } from '../types'
import { noodlui } from '../utils/test-utils'
import { mock } from './mockData'
import ActionChain from '../ActionChain'
import Component from '../components/Base'
import List from '../components/List'
import Viewport from '../Viewport'

let noodlComponent: NOODLComponent
let component: IComponent

beforeEach(() => {
  noodlComponent = mock.raw.getNOODLView() as NOODLComponent
  component = new Component(noodlComponent) as IComponent
})

afterEach(() => {
  noodlui.cleanup()
})

describe('noodl-ui', () => {
  it('should flip initialized to true when running init', () => {
    noodlui.init()
    expect(noodlui.initialized).to.be.true
  })

  it('should set the assets url', () => {
    const prevAssetsUrl = noodlui.assetsUrl
    noodlui.setAssetsUrl('https://google.com')
    expect(noodlui.assetsUrl).to.not.equal(prevAssetsUrl)
  })

  it('should set the page', () => {
    const pageName = 'Loopa'
    const pageObject = { module: 'paper', components: [] }
    noodlui.setRoot(pageName, pageObject)
    expect(noodlui.page).to.equal('')
    noodlui.setPage(pageName)
    expect(noodlui.page).to.equal(pageName)
    expect(noodlui.getPageObject(pageName)).to.equal(pageObject)
  })

  it('should set the root', () => {
    const pageName = 'Loopa'
    const pageObject = { module: 'paper', components: [] }
    expect(noodlui.root).to.not.have.property(pageName, pageObject)
    noodlui.setRoot(pageName, pageObject)
    expect(noodlui.root).to.have.property(pageName, pageObject)
  })

  it('should set the viewport', () => {
    const viewport = new Viewport()
    expect(noodlui.viewport).to.not.equal(viewport)
    noodlui.setViewport(viewport)
    expect(noodlui.viewport).to.equal(viewport)
  })

  it('should set the component node', () => {
    const component = new Component({ type: 'list' })
    expect(noodlui.getNode(component)).to.be.null
    noodlui.setNode(component)
    expect(noodlui.getNode(component)).to.equal(component)
  })

  it('should not return as an array if arg passed was not an array', () => {
    const resolvedComponent = noodlui.resolveComponents(component)
    expect(resolvedComponent).to.be.instanceOf(Component)
  })

  it('should return as array if arg passed was an array', () => {
    const resolvedComponent = noodlui.resolveComponents([component])
    expect(resolvedComponent).to.be.an('array')
    expect(resolvedComponent[0]).to.be.instanceOf(Component)
  })

  it('should return the resolver context', () => {
    expect(noodlui.getContext()).to.have.keys([
      'assetsUrl',
      'page',
      'roots',
      'viewport',
    ])
  })

  xit('should return all resolve options', () => {
    expect(noodlui.getResolverOptions()).to.have.keys([
      'consume',
      'context',
      'getNode',
      'getNodes',
      'getList',
      'getListItem',
      'getState',
      'parser',
      'resolveComponent',
      'setConsumerData',
      'setNode',
      'setList',
    ])
  })

  xit('should return all consumer options', () => {
    expect(noodlui.getConsumerOptions()).to.have.keys([
      'consume',
      'context',
      'createActionChainHandler',
      'createSrc',
      'getNode',
      'getNodes',
      'getList',
      'getListItem',
      'getState',
      'parser',
      'resolveComponent',
      'setConsumerData',
      'setNode',
      'setList',
      'showDataKey',
    ])
  })

  describe('when creating action chain handlers', () => {
    it('should be able to be picked up by the action chain (builtin actions)', async () => {
      const appleSpy = sinon.spy()
      const swordSpy = sinon.spy()
      noodlui.use([
        { funcName: 'apple', fn: appleSpy },
        { funcName: 'sword', fn: swordSpy },
      ])
      const execute = noodlui.createActionChainHandler([
        { actionType: 'builtIn', funcName: 'apple' },
      ])
      await execute()
      expect(appleSpy.called).to.be.true
    })

    it('should be able to be picked up by the action chain (non-builtin actions)', async () => {
      const appleSpy = sinon.spy()
      const swordSpy = sinon.spy()
      noodlui.use([
        { actionType: 'pageJump', fn: appleSpy },
        { actionType: 'updateObject', fn: swordSpy },
      ])
      let execute = noodlui.createActionChainHandler([
        { actionType: 'pageJump', destination: '/hello' },
        { actionType: 'updateObject', object: sinon.spy() },
      ])
      await execute()
      expect(appleSpy.called).to.be.true
      expect(swordSpy.called).to.be.true
      const evalFn = sinon.spy()
      noodlui.use({ actionType: 'evalObject', fn: evalFn })
      expect(evalFn.called).to.be.false
      execute = noodlui.createActionChainHandler([
        { actionType: 'evalObject', object: sinon.spy() },
      ])
      await execute()
      expect(evalFn.called).to.be.true
    })

    xit('should add in the builtIn funcs', async () => {
      const appleSpy = sinon.spy()
      const swordSpy = sinon.spy()
      noodlui.use([
        { funcName: 'apple', fn: appleSpy },
        { funcName: 'sword', fn: swordSpy },
      ])
      const execute = noodlui.createActionChainHandler([
        { actionType: 'builtIn', funcName: 'apple' },
      ])
      await execute()
      expect(appleSpy.called).to.be.true
      // expect(swordSpy.called).to.be.true
    })

    xit('should pass the trigger to actionChain.build', () => {
      //
    })

    xit('should pass in the resolver context', () => {
      //
    })
  })

  describe('state api', () => {
    describe('getNodes', () => {
      it('should return an object of component nodes where key is component id and value is the instance', () => {
        // console.info(noodlui.getNodes())
      })
    })

    describe('getNode', () => {
      xit('should return the component instance', () => {
        //
      })
    })

    xdescribe('resolved component outcomes', () => {
      it('should attach a noodlType property with the original component type', () => {
        noodlComponent = { type: 'view', text: 'hello' }
        const resolvedComponent = noodlui.resolveComponents(noodlComponent)
        expect(resolvedComponent.toJS()).to.have.property('noodlType', 'view')
      })

      it('should convert the onClick to an action chain', () => {
        const onClick = [{ actionType: 'pageJump' }]
        const resolvedComponent = noodlui.resolveComponents({
          type: 'button',
          text: 'hello',
          onClick,
        })
        expect(resolvedComponent.get('onClick')).to.be.instanceOf(ActionChain)
      })
    })
  })

  describe('when resolving components', () => {
    xit(
      'should apply the same resolvers as when calling .resolveComponents ' +
        'when children are created (including deeply nested children',
      () => {
        const noodlList = new List()
        const noodlListItem = noodlList.createChild('listItem')
        const component = noodlui.resolveComponents({
          type: 'view',
          children: [
            { type: 'button', text: 'hello', style: { fontSize: '14px' } },
            { type: 'label', text: 'my label' },
            { type: 'list', style: { width: '40px', height: '40px' } },
          ],
        })
      },
    )
  })
})
