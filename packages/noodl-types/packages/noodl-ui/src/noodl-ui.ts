import _ from 'lodash'
import Logger from 'logsnap'
import Resolver from './Resolver'
import Viewport from './Viewport'
import Component from './Component'
import makeRootsParser from './factories/makeRootsParser'
import {
  forEachDeepEntries,
  forEachEntries,
  formatColor,
  hasLetter,
} from './utils/common'
import ActionChain from './ActionChain'
import isReference from './utils/isReference'
import * as T from './types'
//

const log = Logger.create('noodl-ui')

function _createState(state?: Partial<T.INOODLUiState>): T.INOODLUiState {
  return {
    nodes: new Map(),
    lists: new Map(),
    ...state,
  } as T.INOODLUiState
}

class NOODL implements T.INOODLUi {
  #assetsUrl: string = ''
  #cb: {
    action: Partial<Record<T.ActionEventId, Function[]>>
    builtIn: Partial<Record<string, Function[]>>
    chaining: Partial<Record<T.ActionChainEventId, Function[]>>
  } = {
    action: {},
    builtIn: {},
    chaining: {},
  }
  #page: T.Page = { name: '', object: null }
  #parser: T.RootsParser
  #resolvers: Resolver[] = []
  #root: { [key: string]: any } = {}
  #state: T.INOODLUiState
  #viewport: T.IViewport
  initialized: boolean = false

  constructor({
    showDataKey,
    viewport,
  }: { showDataKey?: boolean; viewport?: T.IViewport } = {}) {
    this.#parser = makeRootsParser({ roots: {} })
    this.#state = _createState({ showDataKey })
    this.#viewport = viewport || new Viewport()
  }

  get assetsUrl() {
    return this.#assetsUrl
  }

  get page() {
    return this.#page
  }

  get parser() {
    return this.#parser
  }

  get root() {
    return this.#root
  }

  get viewport() {
    return this.#viewport
  }

  createActionChain(
    actions: Parameters<T.INOODLUi['createActionChain']>[0],
    {
      trigger,
      ...otherOptions
    }: Parameters<T.INOODLUi['createActionChain']>[1],
  ) {
    const options = { builtIn: this.#cb.builtIn, trigger, ...otherOptions }

    forEachEntries(this.#cb.action, (key, fn) => {
      options[key] = fn
    })

    const actionChain = new ActionChain(actions, {
      ...options,
      ..._.reduce(
        _.entries(this.#cb.action),
        (acc, [actionType, cbs]) =>
          _.isArray(cbs) ? _.assign(acc, { [actionType]: cbs }) : acc,
        {} as any,
      ),
    })

    // @ts-expect-error
    window.ac = actionChain

    return actionChain.build({
      context: this.getContext() as T.ResolverContext,
      parser: this.parser,
      ...otherOptions,
    })
  }

  init({ log, viewport }: Partial<Parameters<T.INOODLUi['init']>[0]> = {}) {
    if (viewport) this.setViewport(viewport)
    this.initialized = true
    Logger[log ? 'enable' : 'disable']?.()
    return this
  }

  on(eventName: T.EventId, cb: any, cb2?: any) {
    if (_.isString(eventName)) this.#addCb(eventName, cb, cb2)
    return this
  }

  off(eventName: T.EventId, cb: Function) {
    if (_.isString(eventName)) this.#removeCb(eventName, cb)
    return this
  }

  emit(eventName: T.EventId, ...args: any[]) {
    if (_.isString(eventName)) {
      const path = this.#getCbPath(eventName)
      if (path) {
        let cbs = _.get(this.#cb, path) as Function[]
        if (!_.isArray(cbs)) cbs = cbs ? [cbs] : []
        _.forEach(cbs, (cb) => cb(...args))
      }
    }
    return this
  }

  #getCbPath = (key: T.EventId | 'action' | 'chaining') => {
    let path = ''
    if (key in this.#cb) {
      path = key
    } else if (key in this.#cb.action) {
      path = `action.${key}`
    } else if (key in this.#cb.builtIn) {
      path = `builtIn.${key}`
    } else if (key in this.#cb.chaining) {
      path = `chaining.${key}`
    }
    return path
  }

  #addCb = (
    key: T.EventId,
    cb: Function | string | { [key: string]: Function },
    cb2: Function,
  ) => {
    if (key === 'builtIn') {
      if (_.isString(cb)) {
        const funcName = cb
        const fn = cb2 as Function
        if (!_.isArray(this.#cb.builtIn[funcName])) {
          this.#cb.builtIn[funcName] = []
        }
        this.#cb.builtIn[funcName]?.push(fn)
      } else if (_.isPlainObject(cb)) {
        forEachEntries(cb as { [key: string]: Function }, (key, value) => {
          const funcName = key
          const fn = value
          if (!_.isArray(this.#cb.builtIn[funcName])) {
            this.#cb.builtIn[funcName] = []
          }
          if (!this.#cb.builtIn[funcName]?.includes(fn)) {
            this.#cb.builtIn[funcName]?.push(fn)
          }
        })
      }
    } else {
      const path = this.#getCbPath(key)
      if (path) {
        if (!_.isArray(this.#cb[path])) this.#cb[path] = []
        this.#cb[path].push(cb as Function)
      }
    }
    return this
  }

  #removeCb = (key: T.EventId, cb: Function) => {
    const path = this.#getCbPath(key)
    if (path) {
      const cbs = _.get(this.#cb, path)
      if (_.isArray(cbs)) {
        if (cbs.includes(cb)) {
          _.set(
            this.#cb,
            path,
            _.filter(cbs, (fn) => fn !== cb),
          )
        }
      }
    }
    return this
  }

  getBaseStyles(styles?: T.NOODLStyle) {
    return {
      ...this.#root.Style,
      position: 'absolute',
      outline: 'none',
      ...styles,
    }
  }

  getContext() {
    return {
      assetsUrl: this.assetsUrl,
      page: this.#root[this.#page.name],
      roots: this.#root,
      viewport: this.#viewport,
    } as T.ResolverContext
  }

  getResolverOptions(include?: { [key: string]: any }) {
    return {
      context: this.getContext(),
      parser: this.parser,
      resolveComponent: this.resolveComponents.bind(this),
      ...this.getStateGetters(),
      ...this.getStateSetters(),
      ...include,
    } as T.ResolverOptions
  }

  getConsumerOptions(include?: { [key: string]: any }) {
    return {
      context: this.getContext(),
      createActionChain: this.createActionChain.bind(this),
      createSrc: this.#createSrc.bind(this),
      resolveComponent: this.resolveComponents.bind(this),
      parser: this.parser,
      showDataKey: this.#state.showDataKey,
      ...this.getStateGetters(),
      ...this.getStateSetters(),
      ...include,
    } as T.ConsumerOptions
  }

  getNodes() {
    return Array.from(this.#state.nodes.values())
  }

  getNode(component: T.IComponent | string) {
    let result: T.IComponent | undefined
    if (component instanceof Component) {
      result = this.#state.nodes.get(component)
    } else if (_.isString(component)) {
      const nodes = Array.from(this.#state.nodes.values())
      const numNodes = nodes.length
      for (let index = 0; index < numNodes; index++) {
        const node = nodes[index]
        if (node.id === component) {
          result = node
          break
        }
      }
    }
    return result || null
  }

  getList(listId: T.IComponent | string) {
    let result: any[] | undefined
    if (listId instanceof Component) {
      //
    } else if (_.isString(listId)) {
      //
    }
    return result || null
  }

  getListItem(
    listId: string | T.IComponent,
    index: number,
    defaultValue?: any,
  ) {
    if (listId) {
      if (listId instanceof Component) {
      } else if (_.isString(listId)) {
      }
    }
    if (!listId || _.isUndefined(index)) return defaultValue
    return this.#state.lists[listId]?.[index] || defaultValue
  }

  getState() {
    return this.#state
  }

  getStateGetters() {
    return {
      consume: this.consume.bind(this),
      getList: this.getList.bind(this),
      getListItem: this.getListItem.bind(this),
      getState: this.getState.bind(this),
      getNodes: this.getNodes.bind(this),
      getNode: this.getNode.bind(this),
    }
  }

  getStateSetters() {
    return {
      setConsumerData: this.setConsumerData.bind(this),
      setNode: this.setNode.bind(this),
      setList: this.setList.bind(this),
    }
  }

  parse(key: string | T.IComponent): T.NOODLComponentProps | any {
    if (_.isString(key)) {
      if (isReference(key)) {
        //
      } else {
        // itemObject.name.firstName
      }
    } else if (key instanceof Component) {
      return this.getNode(key)?.toJS()
    }
  }

  resolveComponents(component: T.ComponentType): T.IComponent
  resolveComponents(components: T.ComponentType[]): T.IComponent[]
  resolveComponents(
    components: T.ComponentType | T.ComponentType[] | T.Page['object'],
  ) {
    if (components) {
      if (components instanceof Component) {
        return this.#resolve(components)
      } else if (!_.isArray(components) && _.isObject(components)) {
        if ('components' in components) {
          return _.map(components.components, (c: T.ComponentType) =>
            this.#resolve(c),
          )
        } else {
          return this.#resolve(components)
        }
      } else if (_.isArray(components)) {
        return _.map(components as T.ComponentType[], (c) => this.#resolve(c))
      }
    }
    return null
  }

  #resolve = (c: T.ComponentType, { id }: { id?: string } = {}) => {
    let component: T.IComponent

    if (c instanceof Component) {
      component = c
    } else {
      component = new Component(c)
    }

    component['id'] = id || _.uniqueId()

    const type = component.get('type')
    const consumerOptions = this.getConsumerOptions({
      component,
    })

    if (!type) {
      log.func('#resolve')
      log.red(
        'Encountered a NOODL component without a "type"',
        component.snapshot(),
      )
    }

    if (this.page && this.parser.getLocalKey() !== this.page.name) {
      this.parser.setLocalKey(this.page.name)
    }

    this.emit('beforeResolve', component, consumerOptions)

    _.forEach(this.#resolvers, (resolver) =>
      resolver.resolve(component, consumerOptions),
    )

    this.emit('afterResolve', component, consumerOptions)

    // Finalizing
    const { style } = component
    if (_.isObjectLike(style)) {
      forEachDeepEntries(style, (key, value) => {
        if (_.isString(value)) {
          if (value.startsWith('0x')) {
            component.set('style', key, formatColor(value))
          } else if (/(fontsize|borderwidth|borderradius)/i.test(key)) {
            if (!hasLetter(value)) {
              component.set('style', key, `${value}px`)
            }
          }
        }
      })
    }

    if (!this.#state.nodes.has(component)) {
      this.#state.nodes.set(component, component)
    }

    return component
  }

  setAssetsUrl(assetsUrl: string) {
    this.#assetsUrl = assetsUrl
    return this
  }

  setPage(pageName: string) {
    this.#page.name = pageName
    this.#page.object = this.#root[pageName]
    return this
  }

  setRoot(root: string | { [key: string]: any }, value?: any) {
    if (_.isString(root)) this.#root[root] = value
    else this.#root = root
    return this
  }

  setViewport(viewport: T.IViewport) {
    this.#viewport = viewport
    return this
  }

  setNode(component: T.IComponent) {
    if (!component.id) {
      console.groupCollapsed(
        `%c[setNode] Cannot set this node to nodes state because the id is invalid`,
        'color:#ec0000',
        component.snapshot(),
      )
      console.trace()
      console.groupEnd()
    } else {
      this.#state.nodes[component.id as string] = component
    }
    return this
  }

  setList(listId, data) {
    this.#state.lists[listId] = data
    return this
  }

  use(mod: T.IResolver | T.IResolver[] | T.IViewport, ...rest: any[]) {
    const mods = (_.isArray(mod) ? mod : [mod]).concat(rest)

    const handleMod = (m: typeof mods[number]) => {
      if (m instanceof Viewport) {
        this.setViewport(m)
      } else if (m instanceof Resolver) {
        this.#resolvers.push(m)
      }
    }

    _.forEach(mods, (m) => {
      if (_.isArray(m)) _.forEach([...m, ...rest], (_m) => handleMod(_m))
      else handleMod(m)
    })

    return this
  }

  unuse(mod: T.IResolver) {
    if (mod instanceof Resolver) {
      this.#resolvers.push(mod)
    }
    return this
  }

  reset() {
    this.#cb = { action: {}, builtIn: {}, chaining: {} }
    this.#parser = makeRootsParser({ roots: {} })
    this.#resolvers = []
    this.#state = _createState()
    this.#root = {}
    this.#viewport = new Viewport()
    this.initialized = false
    return this
  }

  #createSrc = (path: string) => {
    let src = ''
    if (path && _.isString(path)) {
      if (path && _.isString(path)) {
        if (/^(http|blob)/i.test(path)) {
          src = path
        } else if (path.startsWith('~/')) {
          // Should be handled by an SDK
        } else {
          src = this.assetsUrl + path
        }
      }
    }
    return src
  }
}

export default NOODL
