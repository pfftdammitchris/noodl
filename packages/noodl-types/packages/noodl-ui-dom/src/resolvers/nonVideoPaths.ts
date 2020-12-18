import { RegisterOptions } from '../types'

export default {
  name: '[noodl-ui-dom] path (non videos)',
  cond: (n, c, { original }) => !!original?.path && n?.tagName !== 'VIDEO',
  resolve: (node: HTMLImageElement, component) => {
    node.src = component.get('src') || ''
  },
} as RegisterOptions