import sinon from 'sinon'
import fs from 'fs-extra'
import path from 'path'
import { prettyDOM, screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import chalk from 'chalk'
import { expect } from 'chai'
import {
  componentTypes,
  createComponent,
  eventTypes,
  IComponentTypeInstance,
  IList,
  IListItem,
  NOODLComponent,
  NOODLComponentProps,
} from 'noodl-ui'
import { listenToDOM, noodlui, noodluidom, toDOM } from './test-utils'

describe.skip('noodl-ui-dom', () => {
  it('should add the func to the callbacks list', () => {
    const spy = sinon.spy()
    noodluidom.on('button', spy)
    const callbacksList = noodluidom.getCallbacks('button')
    expect(callbacksList).to.be.an('array')
    expect(callbacksList?.[0]).to.eq(spy)
  })

  xit('should remove the func from the callbacks list', () => {
    const spy = sinon.spy()
    noodluidom.on('button', spy)
    let callbacksList = noodluidom.getCallbacks('button')
    expect(callbacksList?.[0]).to.eq(spy)
    noodluidom.off('button', spy)
    callbacksList = noodluidom.getCallbacks('button')
    expect(callbacksList).to.be.an('array')
    expect(callbacksList).not.to.include.members([spy])
  })

  it('should emit events', () => {
    const spy = sinon.spy()
    noodluidom.on('label', spy)
    expect(spy.called).to.be.false
    // @ts-expect-error
    noodluidom.emit('label')
    expect(spy.called).to.be.true
  })

  describe('when attaching component events', () => {
    it('should attach the onChange handler', () => {
      const textField = createComponent('textField') as IComponentTypeInstance
      const spy = sinon.spy()
      textField.set('onChange', spy)
      const node = noodluidom.parse(textField) as HTMLInputElement
      userEvent.type(node, 'hello all')
      expect(spy.called).to.be.true
      expect(node.dataset.value).to.eq('hello all')
    })

    eventTypes.forEach((eventType) => {
      xit(`should not re-attach handlers (duplicating)`, () => {
        const view = createComponent('view') as IComponentTypeInstance
        const list = createComponent('list') as IList
        const listItem = createComponent('listItem') as IListItem
        const textField = createComponent('textField') as IComponentTypeInstance
        textField.set('data-value', 'my data value')
        const label = createComponent('label') as IComponentTypeInstance
        label.set('text', 'heres my text')
        const nestedView = createComponent('view') as IComponentTypeInstance
        view.createChild(list)
        list.createChild(listItem)
        listItem.createChild(nestedView)
        nestedView.createChild(label)
        nestedView.createChild(textField)
      })
    })
  })

  describe('when calling component events', () => {
    let fn1: sinon.SinonSpy
    let fn2: sinon.SinonSpy
    let fn3: sinon.SinonSpy

    beforeEach(() => {
      fn1 = sinon.spy()
      fn2 = sinon.spy()
      fn3 = sinon.spy()
      noodluidom.on('button', fn1)
      noodluidom.on('image', fn2)
      noodluidom.on('button', fn3)
    })

    it('should call callbacks that were subscribed', () => {
      noodluidom.parse(
        noodlui.resolveComponents({
          id: 'myid123',
          type: 'button',
          noodlType: 'button',
          text: 'hello',
        } as NOODLComponent),
      )
      expect(fn1.called).to.be.true
      expect(fn3.called).to.be.true
    })

    it('should not call callbacks that were not subscribed', () => {
      noodluidom.parse(
        noodlui.resolveComponents({
          id: 'myid123',
          type: 'label',
          noodlType: 'label',
          text: 'hello',
        } as NOODLComponent),
      )
      expect(fn1.called).to.be.false
      expect(fn2.called).to.be.false
      expect(fn3.called).to.be.false
    })
  })

  describe('isValidAttribute', () => {
    it('should return true for possible assigned attributes on the dom node', () => {
      expect(noodluidom.isValidAttr('div', 'style')).to.be.true
      expect(noodluidom.isValidAttr('div', 'setAttribute')).to.be.true
      expect(noodluidom.isValidAttr('div', 'id')).to.be.true
      expect(noodluidom.isValidAttr('div', 'dataset')).to.be.true
    })

    it('should return false for all of these', () => {
      expect(noodluidom.isValidAttr('div', 'abc')).to.be.false
      expect(noodluidom.isValidAttr('div', 'value')).to.be.false
      expect(noodluidom.isValidAttr('div', 'options')).to.be.false
    })

    it('should return true for all of these', () => {
      expect(noodluidom.isValidAttr('textarea', 'value')).to.be.true
      expect(noodluidom.isValidAttr('input', 'value')).to.be.true
      expect(noodluidom.isValidAttr('select', 'value')).to.be.true
      expect(noodluidom.isValidAttr('input', 'placeholder')).to.be.true
      expect(noodluidom.isValidAttr('input', 'required')).to.be.true
    })

    it('should return false for all of these', () => {
      expect(noodluidom.isValidAttr('select', 'abc')).to.be.false
      expect(noodluidom.isValidAttr('select', 'rows')).to.be.false
      expect(noodluidom.isValidAttr('input', 'rows')).to.be.false
      expect(noodluidom.isValidAttr('textarea', 'options')).to.be.false
    })
  })

  xdescribe('parse', () => {
    it('should return the expected node', () => {
      const label = noodlui.resolveComponents({
        type: 'label',
        text: 'Title',
        style: {
          color: '0xffffffff',
          width: '0.6',
          height: '0.04',
          fontSize: '18',
          fontStyle: 'bold',
        },
      })
      noodluidom.on('label', (node, props) => {
        if (node) node.innerHTML = `${props.children}`
      })
      const node = noodluidom.parse(label)
      if (node) document.body.appendChild(node)
      expect(node).to.be.instanceOf(HTMLLabelElement)
      expect(screen.getByText('Title'))
    })

    describe('recursing children', () => {
      const labelText = 'the #1 label'
      let component: NOODLComponentProps

      beforeEach(() => {
        component = {
          type: 'div',
          noodlType: 'view',
          id: 'abc',
          style: {
            left: '0',
          },
          children: [
            {
              type: 'div',
              noodlType: 'view',
              text: 'Back',
              style: {},
              id: 'label123',
              children: [
                {
                  type: 'ul',
                  noodlType: 'list',
                  id: 'list123',
                  contentType: 'listObject',
                  listObject: [],
                  iteratorVar: 'itemObject',
                  style: {},
                  children: [
                    {
                      type: 'label',
                      noodlType: 'label',
                      style: {},
                      id: 'label1223',
                      children: labelText,
                      text: labelText,
                    },
                  ],
                },
              ],
            },
          ],
        } as NOODLComponentProps
      })

      it('should append nested children as far down as possible', () => {
        noodluidom.on('label', (node, inst) => {
          if (node) node.innerHTML = inst.get('text')
        })
        noodluidom.parse(noodlui.resolveComponents(component))
        expect(screen.getByText(labelText))
      })
    })
  })

  describe('noodlType: plugin', () => {
    it('should receive null as the "DOM node" in the callback', () => {
      const spy = sinon.spy()
      const component = {
        id: '123',
        type: 'plugin',
        noodlType: 'plugin',
        path: 'https://what.com/what.jpg',
      } as NOODLComponent
      noodluidom.on('plugin', spy)
      noodluidom.parse(noodlui.resolveComponents(component), document.body)
      expect(spy.firstCall.args[0]).to.be.null
    })
  })
})
