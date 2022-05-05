import { AVisitor } from './types'

class ObjVisitor extends AVisitor {
  #callback: (args: { name: string; key: any; value: any; path: any }) => any

  visit(name: string, value: any) {
    let results = []

    if (Array.isArray(value)) {
      results = results.concat(
        value.reduce((acc, val, index) => {
          const result = this.#callback({
            name,
            key: index,
            value: val,
            parent: value,
          })
          if (typeof result !== 'undefined') acc.push(result)
          acc.push(...this.visit(name, val))
          return acc
        }, []),
      )
    } else if (value !== null && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        const result = this.#callback({ key, value: val, parent: value })
        if (typeof result !== 'undefined') results.push(result)
        results.push(...this.visit(name, val))
      }
    } else {
      const result = this.#callback({ key: null, value, parent })
      if (typeof result !== 'undefined') results.push(result)
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

export default ObjVisitor
