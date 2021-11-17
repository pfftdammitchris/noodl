import { expect } from 'chai'

describe(`visit`, () => {
  describe(`arguments`, () => {
    xit(`should pass in the page name`, () => {
      //
    })

    xit(`should pass in the document node`, () => {
      //
    })

    xit(`should pass in the store object`, () => {
      //
    })

    xit(`should pass in the root object`, () => {
      //
    })

    xit(`should pass in the original key, node, and path from original visitor fn`, () => {
      //
    })
  })

  describe(`return value behavior`, () => {
    xit(`should skip the children if returning visit.SKIP`, () => {
      //
    })

    xit(`should skip the traversal if returning visit.BREAK`, () => {
      //
    })

    xit(`should remove the node and continue with the next one when returning visit.REMOVE`, () => {
      //
    })

    xit(`should replace the current node and continue traversing it when returning a node`, () => {
      //
    })

    xit(`should set the index as the next index if returning a number`, () => {
      //
    })
  })
})
