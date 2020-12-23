import { eventTypes } from 'noodl-ui'
import { normalizeEventName } from '../utils'
import { NOODLDOMDataValueElement, RegisterOptions } from '../types'

export default {
  name: '[noodl-ui-dom] events',
  cond: (n, c) => !!(n && c),
  resolve: (node: NOODLDOMDataValueElement, component) => {
    eventTypes.forEach((eventType: string) => {
      if (typeof component.get(eventType) === 'function') {
        // Putting a setTimeout here helps to avoid the race condition in where
        // the emitted action handlers are being called before local root object
        // gets their data values updated.
        // TODO - Unit test + think of a better solution
        node.addEventListener(normalizeEventName(eventType), (e) => {
          setTimeout(() => Promise.resolve(component.get(eventType)(e)))
        })
      }
    })
  },
} as RegisterOptions
