import * as u from '@jsmanifest/utils'
import path from 'path'
import { expect } from 'chai'
import y from 'yaml'
import nock from 'nock'
import sinon from 'sinon'
import Extractor from '../Extractor'
import type { PageObject } from 'noodl-types'
import DocIterator from '../DocIterator'
import ObjIterator from '../ObjIterator'
import { getRoot } from './test-utils'

describe(`iterators`, () => {
  describe(`DocIterator`, () => {
    let doc: y.Document.Parsed
    let iter: DocIterator
    let pageObject: PageObject

    beforeEach(() => {
      iter = new DocIterator()
      pageObject = {
        title: 'SignIn',
        init: [],
        components: [
          {
            type: 'button',
            text: 'Click me',
            onClick: [{ if: [1, 2, {}] }],
          },
          { type: 'label', dataKey: 'formData.password' },
        ],
      }
      doc = y.parseDocument(y.stringify(pageObject))
    })

    it(`[getItems] should return the items`, () => {
      const popDoc = new y.Document({ hello: [123] }) as y.Document.Parsed
      const items = iter.getItems({ SignIn: doc, Pop: popDoc })
      expect(items[0][0]).to.eq('SignIn')
      expect(items[0][1]).to.eq(doc)
      expect(items[1][0]).to.eq('Pop')
      expect(items[1][1]).to.eq(popDoc)
    })

    it(`[getIterator] should be able to iterate over the items in order`, () => {
      const popDoc = new y.Document({ hello: [123] }) as y.Document.Parsed
      const entries = iter.getItems({ SignIn: doc, Pop: popDoc })
      const spy = sinon.spy()
      for (const [name, node] of iter.getIterator(entries)) {
        console.log({ name })
        spy(name, node)
      }
      expect(spy).to.be.calledTwice
      const firstCallArgs = spy.firstCall.args
      const secondCallArgs = spy.secondCall.args
      expect(firstCallArgs[0]).to.eq('SignIn')
      expect(secondCallArgs[0]).to.eq('Pop')
      expect(y.isDocument(firstCallArgs[1])).to.be.true
      expect(y.isDocument(secondCallArgs[1])).to.be.true
    })

    describe(`ObjIterator`, () => {
      let obj: any
      let iter: ObjIterator
      let pageObject: PageObject

      beforeEach(() => {
        iter = new ObjIterator()
        pageObject = {
          title: 'SignIn',
          init: [],
          components: [
            {
              type: 'button',
              text: 'Click me',
              onClick: [{ if: [1, 2, {}] }],
            },
            { type: 'label', dataKey: 'formData.password' },
          ],
        }
        obj = pageObject
      })

      it(`[getItems] should return the items`, () => {
        const popObj = { hello: [123] }
        const items = iter.getItems({ SignIn: obj, Pop: popObj })
        expect(items[0][0]).to.eq('SignIn')
        expect(items[0][1]).to.eq(obj)
        expect(items[1][0]).to.eq('Pop')
        expect(items[1][1]).to.eq(popObj)
      })

      it(`[getIterator] should be able to iterate over the items in order`, () => {
        const popDoc = { hello: [123] }
        const entries = iter.getItems({ SignIn: obj, Pop: popDoc })
        const spy = sinon.spy()
        for (const [name, node] of iter.getIterator(entries)) {
          spy(name, node)
        }
        expect(spy).to.be.calledTwice
        const firstCallArgs = spy.firstCall.args
        const secondCallArgs = spy.secondCall.args
        expect(firstCallArgs[0]).to.eq('SignIn')
        expect(secondCallArgs[0]).to.eq('Pop')
        expect(firstCallArgs[1]).to.exist
        expect(secondCallArgs[1]).to.exist
      })
    })
  })
})
