import y from 'yaml'
import * as is from './utils/is'
import { AVisitor } from './types'

class DocVisitor extends AVisitor {
  #callback: (args: { name: string; key: any; value: any; path: any }) => any

  visit(name: string, value: any) {
    const results = [] as any[]

    if (y.isNode(value) || y.isDocument(value)) {
      y.visit(value, (key, node, path) => {
        const result = this.#callback?.({ name, key, value: node, path })
        if (result) {
          if (Array.isArray(result)) results.push(...result)
          else results.push(result)
        }
      })
    }

    return results
  }

  use(
    callback: (args: {
      name: string
      key: any
      value: any
      path: any[]
    }) => any,
  ) {
    this.#callback = callback
    return this
  }
}

export default DocVisitor
