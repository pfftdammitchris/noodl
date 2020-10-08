import _ from 'lodash'
import { queryHelpers } from '@testing-library/dom'
import {
  getElementType,
  getAlignAttrs,
  getBorderAttrs,
  getCustomDataAttrs,
  getChildren,
  getColors,
  getEventHandlers,
  getFontAttrs,
  getPosition,
  getReferences,
  getStylesByElementType,
  getSizes,
  getTransformedAliases,
  getTransformedStyleAliases,
  NOODL,
  NOODLComponentProps,
  Viewport,
} from 'noodl-ui'
import NOODLUIDOM, { NOODLDOMElement } from 'noodl-ui-dom'

export const queryByDataKey = queryHelpers.queryByAttribute.bind(
  null,
  'data-key',
)

export const queryByDataListId = queryHelpers.queryByAttribute.bind(
  null,
  'data-listid',
)

export const queryByDataName = queryHelpers.queryByAttribute.bind(
  null,
  'data-name',
)

export const queryByDataValue = queryHelpers.queryByAttribute.bind(
  null,
  'data-value',
)

export const queryByDataUx = queryHelpers.queryByAttribute.bind(null, 'data-ux')

export const assetsUrl = 'https://aitmed.com/assets/'

export const noodl = new NOODL()
  .init({ viewport: new Viewport() })
  .setAssetsUrl(assetsUrl)
  .setViewport({ width: 375, height: 667 })
  .setPage({ name: '', object: null })
  .setResolvers(
    getElementType,
    getTransformedAliases,
    getReferences,
    getAlignAttrs,
    getBorderAttrs,
    getColors,
    getFontAttrs,
    getPosition,
    getSizes,
    getStylesByElementType,
    getTransformedStyleAliases,
    getChildren as any,
    getCustomDataAttrs,
    getEventHandlers,
  )

export const noodluidom = (function () {
  let _inst: NOODLUIDOM

  const _resetInstance = () => {
    _inst = new NOODLUIDOM()
    Object.defineProperty(_inst, 'reset', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: function () {
        _resetInstance()
      },
    })
  }

  _resetInstance()

  // @ts-expect-error
  return _inst as NOODLUIDOM & { reset: typeof _resetInstance }
})()

export function toDOM(props: NOODLComponentProps): NOODLDOMElement | null {
  const node = noodluidom.parse(props)
  document.body.appendChild(node as NOODLDOMElement)
  return node
}
