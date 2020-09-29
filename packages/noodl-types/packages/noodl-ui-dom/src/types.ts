import { NOODLComponentProps, NOODLComponentType } from 'noodl-ui'
import { noodlDOMEvents } from './constants'

export interface INOODLUIDOM {
  on(eventName: NOODLDOMCreateNodeEvent, cb: Function): this
  off(eventName: NOODLDOMCreateNodeEvent, cb: Function): this
  emit(eventName: NOODLDOMCreateNodeEvent, ...args: any[]): this
  getEventListeners(eventName: NOODLDOMCreateNodeEvent): Function[]
  getUtils(): { parse: Parser }
  isValidAttribute(tagName: NOODLDOMTagName, key: string): boolean
  onCreateNode(type: 'all' | NOODLComponentType, cb: Parser): this
  parse(props: NOODLComponentProps): NOODLElement | null
}

export type NOODLDOMComponentType = keyof typeof noodlDOMEvents

export type NOODLDOMCreateNodeEvent = typeof noodlDOMEvents[keyof typeof noodlDOMEvents]

export interface Parser {
  (
    node: NOODLElement,
    props: NOODLComponentProps,
    parserOptions?: ParserOptions,
  ): any
}

export type ParserArgs = Parameters<Parser>

export interface ParserOptions {
  parse: Parser
}

export type NOODLElements = Pick<
  HTMLElementTagNameMap,
  | 'a'
  | 'article'
  | 'audio'
  | 'b'
  | 'blockquote'
  | 'body'
  | 'br'
  | 'button'
  | 'canvas'
  | 'caption'
  | 'code'
  | 'col'
  | 'div'
  | 'em'
  | 'embed'
  | 'fieldset'
  | 'figure'
  | 'footer'
  | 'form'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'header'
  | 'hr'
  | 'html'
  | 'i'
  | 'img'
  | 'input'
  | 'iframe'
  | 'label'
  | 'li'
  | 'link'
  | 'main'
  | 'meta'
  | 'nav'
  | 'noscript'
  | 'ol'
  | 'option'
  | 'p'
  | 'pre'
  | 'script'
  | 'select'
  | 'section'
  | 'small'
  | 'source'
  | 'span'
  | 'strong'
  | 'style'
  | 'table'
  | 'tbody'
  | 'td'
  | 'textarea'
  | 'tfoot'
  | 'th'
  | 'thead'
  | 'title'
  | 'tr'
  | 'track'
  | 'ul'
  | 'video'
>

export type NOODLElementTypes = keyof NOODLElements

export type NOODLElement = Extract<
  NOODLElements[NOODLElementTypes],
  HTMLElement
>

export type NOODLDOMTagName = keyof HTMLElementTagNameMap

export type DataValueElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement

// export type PageListenerName =
//   | 'onStart'
//   | 'onRootNodeInitializing'
//   | 'onRootNodeInitialized'
//   | 'onBeforePageRender'
//   | 'onPageRendered'
//   | 'onPageRequest'
//   | 'onModalStateChange'
//   | 'onError'

// export interface PageModalState {
//   id: string
//   opened: boolean
//   context: null | { [key: string]: any }
//   props: { [key: string]: any }
// }

// export interface PageSnapshot extends NOODLUiPage {
//   components?: NOODLComponentProps[]
// }

// // export type PageRenderStatus = typeof constants.pageRenderStatuses[number]
// export type PageRenderStatus = typeof renderStatus[keyof typeof renderStatus]

// export interface PageRootNodeState {
//   id: string
//   initializing: boolean
//   initialized: boolean
//   initializeError: null | SerializedError
// }

// export interface PageComponentsRenderState {
//   rendering: boolean
//   rendered: boolean
//   renderError: null | SerializedError
// }
