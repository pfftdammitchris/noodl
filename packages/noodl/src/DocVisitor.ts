import y from 'yaml'
import { AVisitor, YAMLVisitorCallback } from './types'

export type DocVisitOptions = { name?: string } & Record<string, any>

function wrap<N = any>(
  callback: YAMLVisitorCallback<N>,
  { data, name }: DocVisitOptions & { data: Record<string, any> },
) {
  return function onVisit(...[key, node, path]: Parameters<y.visitorFn<N>>) {
    const callbackArgs: Parameters<YAMLVisitorCallback<any>>[0] = {
      name,
      key,
      value: node,
      path: path as any,
      get data() {
        return data
      },
    }

    const control = callback(callbackArgs)

    if (control != undefined) {
      if (control === y.visit.BREAK) {
        return y.visit.BREAK
      }

      if (control === y.visit.REMOVE) {
        return y.visit.REMOVE
      }

      if (control === y.visit.SKIP) {
        return y.visit.SKIP
      }

      if (y.isNode(control)) {
        return control
      }

      if (typeof control === 'number') {
        return control
      }
    }

    return undefined
  }
}

class DocVisitor extends AVisitor {
  #callback: YAMLVisitorCallback

  visit<D extends Record<string, any> = Record<string, any>>(
    value: any,
    options?: DocVisitOptions,
  ) {
    const data = {} as D

    if (y.isNode(value) || y.isDocument(value)) {
      y.visit(value, wrap(this.#callback, { ...options, data }))
    }

    return data
  }

  use(callback: YAMLVisitorCallback) {
    this.#callback = callback
    return this
  }
}

export default DocVisitor
