import {
  getElementType,
  getAlignAttrs,
  getBorderAttrs,
  getCustomDataAttrs,
  getColors,
  getEventHandlers,
  getFontAttrs,
  getPlugins,
  getPosition,
  getReferences,
  getStylesByElementType,
  getSizes,
  getTransformedAliases,
  getTransformedStyleAliases,
  isComponent,
  NOODL,
  ResolverFn,
  Viewport,
} from 'noodl-ui'
import { NOODLDOMElement } from './types'
import NOODLUIDOM from './noodl-ui-dom'

export const noodluidom = new NOODLUIDOM()
export const assetsUrl = 'https://aitmed.com/assets/'
export const viewport = new Viewport()
export const noodlui = new NOODL()

viewport.width = 365
viewport.height = 667

export function getAllResolvers() {
  return [
    getAlignAttrs,
    getBorderAttrs,
    getColors,
    getCustomDataAttrs,
    getElementType,
    getEventHandlers,
    getFontAttrs,
    getPlugins,
    getPosition,
    getReferences,
    getSizes,
    getStylesByElementType,
    getTransformedAliases,
    getTransformedStyleAliases,
  ] as ResolverFn[]
}

export function toDOM(props: any): NOODLDOMElement | null {
  let node: HTMLElement | null = null
  if (isComponent(props)) {
    node = noodluidom.parse(props)
  } else if (typeof props === 'object' && 'type' in props) {
    node = noodluidom.parse(noodlui.resolveComponents(props))
  }
  if (node) document.body.appendChild(node as any)
  return node
}
