import _ from 'lodash'
import { createSelector } from '@reduxjs/toolkit'
import {
  NOODLComponent,
  NOODLComponentProps,
  Page as NOODLUiPage,
} from 'noodl-ui'
import modalComponents from './components/modalComponents'
import { modalIds, CACHED_PAGES } from './constants'
import { observeStore } from './utils/common'
import { cadl, noodl } from './app/client'
import {
  AppStore,
  CachedPage,
  ModalId,
  OnBeforePageChange,
  PageSnapshot,
} from './app/types'
import { toDOMNode } from './utils/parser'
import Modal from './components/NOODLModal'

export type PageListenerName = 'onBeforePageChange' | 'onBeforePageRender'

export interface PageOptions {
  rootNode?: HTMLElement | null
  nodes?: HTMLElement[] | null
  store: AppStore
  builtIn?: {
    [funcName: string]: any
  }
}

/**
 * This Page class is responsible for managing a NOODL page's state that is relative
 * to the page that is being presented to the user, like managing parsed components or
 * action chains that are running.
 */
class Page {
  private _initializeRootNode: () => void
  private _preparePage: (pageName: string, options?: any) => Promise<any>
  private _listeners: { [name: string]: Function } = {}
  public builtIn: PageOptions['builtIn']
  public history: CachedPage[] = []
  public rootNode: HTMLElement | null = null
  public nodes: HTMLElement[] | null
  public modal: Modal

  constructor({ builtIn, rootNode = null, store, nodes = null }: PageOptions) {
    this.builtIn = builtIn
    this.rootNode = rootNode
    this.nodes = nodes
    this.modal = new Modal()

    this._initializeRootNode = () => {
      const root = document.createElement('div')
      root.id = 'root'
      root.style.position = 'absolute'
      root.style.width = '100%'
      root.style.height = '100%'
      this.rootNode = root
      document.body.appendChild(root)
    }

    this._preparePage = async (pageName: string, options = {}) => {
      await cadl?.initPage(pageName, [], {
        builtIn: this.builtIn,
        ...options,
      })
    }

    // Respnsible for keeping the UI in sync with changes to page routes
    observeStore(
      store,
      createSelector(
        (state) => state.page.previousPage,
        (state) => state.page.currentPage,
        (previousPage, currentPage) => ({ previousPage, currentPage }),
      ),
      async ({ currentPage }) => {
        if (currentPage) {
          await this._preparePage(currentPage)
          await this.navigate(currentPage)
        }
      },
    )

    // Responsible for managing the modal component
    observeStore(
      store,
      createSelector(
        (state) => state.page.modal,
        (modalState) => modalState,
      ),
      ({ id, opened, ...rest }) => {
        if (opened) {
          const modalId = modalIds[id as ModalId]
          const modalComponent = modalComponents[modalId]
          if (modalComponent) {
            this.modal.open(id, modalComponent, { opened, ...rest })
          } else {
            // log
          }
        } else {
          this.modal.close()
        }
      },
    )
  }

  public async navigate(
    pageName: string,
    options?: any,
  ): Promise<{ snapshot: PageSnapshot }> {
    if (!this.rootNode) {
      this._initializeRootNode()
    }

    await this._callListener('onBeforePageChange', {
      pageName,
      rootNode: this.rootNode,
    } as OnBeforePageChange)

    let pageSnapshot: NOODLUiPage | undefined
    let components: NOODLComponentProps[] = []

    if (!pageName) {
      const logMsg = `%c[Page.ts][navigate] Cannot navigate because pageName is invalid`
      const logStyle = `color:#ec0000;font-weight:bold;`
      console.log(logMsg, logStyle, { pageName, rootNode: this.rootNode })
      window.alert(`The value of page "${pageName}" is not valid`)
    } else {
      // Load the page in the SDK
      await this._preparePage(pageName, {
        ...options,
        builtIn: {
          ...this.builtIn,
          ...options?.builtIn,
        },
      })

      pageSnapshot = {
        name: pageName,
        object: cadl.root?.[pageName],
      }

      await this._callListener('onBeforePageRender', pageSnapshot)

      const rendered = this.render(cadl?.root?.[pageName]?.components)

      if (_.isArray(rendered.components)) {
        components = rendered.components
      }
    }

    return {
      snapshot: _.assign({ components: components }, pageSnapshot),
    }
  }

  /**
   * Returns the link to the main dashboard page by using the noodl base url
   * @param { string } baseUrl - Base url retrieved from the noodl config
   */
  public getDashboardPath(baseUrl: string = cadl.cadlBaseUrl || '') {
    const isMeetingConfig = /meeting/i.test(baseUrl)
    const regex = isMeetingConfig ? /(dashboardmeeting|meeting)/i : /dashboard/i
    return this.getPagePath(regex)
  }

  /** Handles onClick events for "goTo" handling.
   *    Ex: A NOODL page gives an onClick a value of "goToDashboard"
   *     The underlying function here will take a path string/regex and find a matching
   *     page path from the config, and will return the path if found.
   *     Otherwise it will return an empty string
   * @param { null | NOODLConfig } config
   * @return { string }
   */
  public getPagePath(pageName: string | RegExp) {
    const pages = cadl?.cadlEndpoint?.page || []
    const pagePath = _.find(pages, (name: string) =>
      _.isString(pageName)
        ? name.includes(pageName)
        : pageName instanceof RegExp
        ? pageName.test(name)
        : false,
    )
    return pagePath || ''
  }

  /** Navigates to a page using a portion of a page path uri
   * @param { string } pageName - Name of the page
   */
  // TODO: This func will will be deprecated in favor of this.navigate
  public async goToPage(pageName: string) {
    // Ensure the first letter is uppercased
    pageName = _.upperFirst(String(pageName))
    const pagePath = this.getPagePath(pageName)
    if (pagePath) {
      //
    } else {
      window.alert(`Could not find page ${pageName}`)
    }
  }

  public registerListener(
    listenerName: PageListenerName,
    listener: (...args: any[]) => any,
  ) {
    if (!_.isFunction(this._listeners[listenerName])) {
      this._listeners[listenerName] = listener
    } else {
      const logMsg = `%cAn existing listener named ${listenerName} was already registered. It will be removed and replaced with this one`
      const logStyle = `color:#ec0000;font-weight:bold;`
      console.log(logMsg, logStyle)
    }
    return this
  }

  public hasListener(listenerName: string) {
    return _.isFunction(this._listeners[listenerName])
  }

  /**
   * Takes a list of raw NOODL components and converts them into DOM nodes and appends
   * them to the DOM
   * @param { NOODLUIPage } page - Page in the shape of { name: string; object: null | NOODLPageObject }
   */
  public render(rawComponents: NOODLComponent[]) {
    // @ts-expect-error
    window.components = rawComponents
    let components

    if (_.isArray(rawComponents)) {
      components = noodl.resolveComponents()
      // @ts-expect-error
      window.resolvedComponents = components

      let node

      if (this.rootNode) {
        // Clean up previous nodes
        this.rootNode.innerHTML = ''
        _.forEach(components, (component) => {
          node = toDOMNode(component)
          if (node) {
            this.rootNode?.appendChild(node)
          }
        })
      } else {
        const logMsg =
          "Attempted to render the page's components but the root " +
          'node was not initialized. The page will not show anything'
        const logStyle = `color:#ec0000;font-weight:bold;`
        console.log(logMsg, logStyle, {
          rootNode: this.rootNode,
          nodes: this.nodes,
        })
      }
    } else {
      // TODO
    }

    return {
      components,
    }
  }

  /**
   *  Returns a JS representation of the current rootNode and nodes of the
   * current page
   */
  public getNodes() {
    return {
      rootNode: this.rootNode,
      nodes: this.nodes,
    }
  }

  /** Adds the current page name to the end in the list of cached pages */
  public cachePage(name: string) {
    this.setCache({
      name,
    })
    return this
  }

  /** Retrieves a list of cached pages */
  public getCache(): CachedPage[] {
    const pageHistory = window.localStorage.getItem(CACHED_PAGES)
    if (pageHistory) {
      try {
        this.history = JSON.parse(pageHistory)
      } catch (error) {
        console.error(error)
      }
    }
    return this.history || []
  }

  /** Sets the list of cached pages */
  public setCache(cachedPage: CachedPage | CachedPage[]) {
    const cachedPages = (_.isString(cachedPage)
      ? [cachedPage]
      : _.isArray(cachedPage)
      ? cachedPage
      : []) as CachedPage[]
    if (cachedPages.length) {
      const prevCache = this.getCache()
      const nextCache = [...prevCache, ...cachedPages]
      window.localStorage.setItem(CACHED_PAGES, JSON.stringify(nextCache))
      this.history = nextCache
    }
    return this
  }

  public setBuiltIn(builtIn: any) {
    this.builtIn = builtIn
    return this
  }

  private _callListener(listenerName: PageListenerName, ...args: any[]) {
    const result = this._listeners[listenerName]?.(...args)
    if (result && result instanceof Promise) {
      return Promise.resolve(result)
    }
    return result
  }
}

export default Page
