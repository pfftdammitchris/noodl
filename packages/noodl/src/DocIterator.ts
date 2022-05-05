import y from 'yaml'
import * as t from './types'

export function isNode(value: unknown): value is t.YAMLNode {
  return y.isNode(value) || y.isDocument(value) || y.isPair(value)
}

class DocIterator extends t.AIterator<t.YAMLNode> {
  getIterator(
    items: [name: string, node: t.YAMLNode][],
  ): Iterator<[name: string, node: t.YAMLNode], any> {
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
  }

  getItems(data: Record<string, t.YAMLNode>) {
    return Object.entries(data)
  }
}

export default DocIterator
