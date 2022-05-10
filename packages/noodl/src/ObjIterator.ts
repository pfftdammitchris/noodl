import * as t from './types'

class ObjIterator extends t.AIterator<any> {
  // @ts-expect-error
  getIterator(items: [name: string, node: any][]) {
    return {
      [Symbol.iterator](): Iterator<[name: string, node: any], any> {
        items = [...items].reverse()
        return {
          next() {
            return {
              get value() {
                return items.pop()
              },
              done: !items.length,
            }
          },
        }
      },
    }
  }

  getItems(data: Record<string, any>) {
    return Object.entries(data)
  }
}

export default ObjIterator
