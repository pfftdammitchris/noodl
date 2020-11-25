import Logger from 'logsnap'
import {
  createComponent,
  getType,
  IComponentTypeInstance,
  IComponentTypeObject,
  IListItem,
  NOODLComponentType,
} from 'noodl-ui'
import { publish } from 'noodl-utils'
import { getShape } from './utils'
import {
  componentEventMap,
  componentEventIds,
  componentEventTypes,
} from './constants'
import * as T from './types'

const log = Logger.create('noodl-ui-dom')

class NOODLUIDOM implements T.INOODLUiDOM {
  #callbacks: {
    all: Function[]
    component: Record<T.NOODLDOMComponentType, Function[]>
  } = {
    all: [],
    component: componentEventTypes.reduce(
      (acc, evt: T.NOODLDOMComponentType) => Object.assign(acc, { [evt]: [] }),
      {} as Record<T.NOODLDOMComponentType, Function[]>,
    ),
  }
  #stub: { elements: { [key: string]: T.NOODLDOMElement } } = { elements: {} }
  #state: {
    pairs: {
      [componentId: string]: {
        component: IComponentTypeInstance
        node: HTMLElement | null
        shape: Partial<IComponentTypeObject>
      }
    }
  } = { pairs: {} }

  constructor({ log }: { log?: { enabled?: boolean } } = {}) {
    Logger[log?.enabled ? 'enable' : 'disable']?.()
  }

  /**
   * Parses props and returns a DOM Node described by props. This also
   * resolves its children hieararchy until there are none left
   * @param { IComponentTypeInstance } props
   */
  parse<C extends IComponentTypeInstance>(
    component: C,
    container?: T.NOODLDOMElement | null,
  ) {
    let node: T.NOODLDOMElement | null = null

    const { noodlType } = component || ({} as IComponentTypeInstance)

    if (component) {
      if (noodlType === 'plugin') {
        // Don't create a node. Except just emit the events accordingly
        // This is to allow the caller to determine whether they want to create
        // a separate DOM node or not
        this.emit('component', null, component)
        this.emit('plugin', null, component)
      } else {
        if (component.noodlType === 'image') {
          node = new Image()
          node.onload = () => {
            ;(container || document.body).insertBefore(
              node as HTMLImageElement,
              (container as HTMLElement).childNodes[0],
            )
          }
          setTimeout(() => {
            ;(node as HTMLImageElement).src = component.get('src')
          }, 10)
        } else {
          node = document.createElement(getType(component))
        }

        if (node) {
          if (component?.noodlType === 'list') {
            // noodl-ui delegates the responsibility for us to decide how
            // to control how list children are first rendered to the DOM
            const listComponent = component as any
            const listObject = listComponent.getData()
            const numDataObjects = listObject?.length || 0
            if (numDataObjects) {
              listComponent.children().forEach((c: IListItem) => {
                c?.setDataObject?.(null)
                listComponent.removeDataObject(0)
              })
              listComponent.set('listObject', [])
              // Remove the placeholders
              for (let index = 0; index < numDataObjects; index++) {
                // This emits the "create list item" event that we should already have a listener for
                listComponent.addDataObject(listObject[index])
              }
            }
          }
          this.emit('component', node, component)
          if (componentEventMap[noodlType as NOODLComponentType]) {
            this.emit(componentEventMap[noodlType], node, component)
          }
          const parent = container || document.body
          if (!parent.contains(node)) parent.appendChild(node)
          if (component.length) {
            component.children().forEach((child: IComponentTypeInstance) => {
              const childNode = this.parse(child, node) as HTMLElement
              node?.appendChild(childNode)
            })
          }
        }
      }
    }

    return node || null
  }

  /**
   * Registers a listener to the listeners list
   * @param { string } eventName - Name of the listener event
   * @param { function } callback - Callback to invoke when the event is emitted
   */
  on(
    eventName: T.NOODLDOMEvent,
    callback: (
      node: T.NOODLDOMElement | null,
      component: IComponentTypeInstance,
    ) => void,
  ) {
    const callbacks = this.getCallbacks(eventName)
    if (Array.isArray(callbacks)) callbacks.push(callback)
    return this
  }

  /**
   * Removes a listener's callback from the listeners list
   * @param { string } eventName - Name of the listener event
   * @param { function } callback
   */
  off<E extends T.NOODLDOMEvent>(
    eventName: E,
    callback: Parameters<T.INOODLUiDOM['off']>[1],
  ) {
    const callbacks = this.getCallbacks(eventName)
    if (Array.isArray(callbacks)) {
      const index = callbacks.indexOf(callback)
      if (index !== -1) callbacks.splice(index, 1)
    }
    return this
  }

  /**
   * Emits an event name and calls all the callbacks registered to that event
   * @param { string } eventName - Name of the listener event
   * @param { ...any[] } args
   */
  emit<E extends string = T.NOODLDOMEvent>(
    eventName: E,
    node: T.NOODLDOMElement | null,
    component: IComponentTypeInstance,
  ) {
    const callbacks = this.getCallbacks(eventName as T.NOODLDOMEvent)
    if (Array.isArray(callbacks)) {
      callbacks.forEach((fn) => fn && fn(node as T.NOODLDOMElement, component))
    }
    return this
  }

  /**
   * Takes either a component type or any other name of an event and returns the
   * callbacks associated with it
   * @param { string } value - Component type or name of the event
   */
  getCallbacks(eventName?: T.NOODLDOMEvent) {
    if (!arguments.length) return this.#callbacks
    if (typeof eventName === 'string') {
      const callbacksMap = this.#callbacks
      if (eventName === 'component') return callbacksMap.all
      if (componentEventIds.includes(eventName)) {
        return callbacksMap.component[this.#getEventKey(eventName)]
      } else if (eventName) {
        if (!callbacksMap[eventName]) callbacksMap[eventName] = []
        return callbacksMap[eventName]
      }
    }
    return null
  }

  getPair(componentId: string) {
    return this.#state.pairs[componentId]
  }

  getState() {
    return this.#state
  }

  redraw(
    node: HTMLElement | null, // ex: li (dom node)
    component: IComponentTypeInstance, // ex: listItem (component instance)
    opts?: {
      resolver?: (
        noodlComponent: IComponentTypeObject | IComponentTypeObject[],
      ) => IComponentTypeInstance
    },
  ) {
    log.func('redraw')

    let newNode: HTMLElement | null = null
    let newComponent: IComponentTypeInstance | undefined

    if (component) {
      const shape = getShape(component)
      const parent = component.parent()

      // Clean up noodl-ui listeners
      component.clearCbs?.()
      // Remove the child reference from the parent
      component.parent()?.removeChild?.(component)
      // Remove the parent reference
      component.setParent?.(null)
      // Deeply walk down the tree hierarchy
      publish(component, (c) => {
        if (c) {
          const parent = c.parent?.()
          // Remove listeners
          c.clearCbs()
          // Remove child component references
          parent?.removeChild?.(c)
          // Remove the child's parent reference
          c.setParent?.(null)
        }
      })
      // Create the new component
      newComponent = createComponent(shape)
      if (parent && newComponent) {
        // Set the original parent on the new component
        newComponent.setParent(parent)
        // Set the new component as a child on the parent
        parent.createChild(newComponent)
        // Run the resolver if provided
        // !NOTE - opts.resolver needs to be provided as an anonymous func to preserve the "this" value
        opts?.resolver?.(newComponent)
      } else {
        // log --> !parent || !newComponent
      }
    }

    if (node) {
      // Delete the node tree
      node.innerHTML = ''
      const parentNode = node.parentNode
      if (component.noodlType === 'image') {
        newNode = new Image()
        newNode.onload = () => {
          if (parentNode) {
            node.remove()
            parentNode.insertBefore(
              newNode as HTMLImageElement,
              parentNode.childNodes[0],
            )
            // parentNode.replaceChild(newNode, node)
          }
        }
        setTimeout(() => {
          ;(newNode as HTMLImageElement).src = component.get('src')
        }, 10)
      } else {
        newNode = document.createElement(getType(component))
        if (parentNode) {
          parentNode.replaceChild(newNode as HTMLElement, node)
        }
      }

      this.emit('component', newNode, newComponent as IComponentTypeInstance)
      this.emit(
        componentEventMap[component.noodlType],
        newNode,
        newComponent as IComponentTypeInstance,
      )
    } else if (component) {
      // Some components like "plugin" can have a null as their node, but their
      // component is still running
      this.emit('component', null, newComponent as IComponentTypeInstance)
      this.emit(
        componentEventMap[component.noodlType],
        null,
        newComponent as IComponentTypeInstance,
      )
    }

    return [newNode, newComponent] as [typeof node, typeof component]
  }

  /**
   * "Redraws" the DOM element tree starting from "node"
   * @param { HTMLElement | null } node - DOM node
   * @param { IComponentTypeInstance } component - noodl-ui component instance
   */
  redraw_backup(
    node: HTMLElement | null, // ex: li (dom node)
    component: IComponentTypeInstance, // ex: listItem (component instance)
  ) {
    log.func('redraw')

    // Redraw the current node
    this.emit(componentEventMap.all, node, component)
    this.emit(componentEventMap[component?.noodlType], node, component)

    publish(component, (c) => {
      const childNode = document.getElementById(c?.id)
      if (childNode) {
        log.grey('CALLING REDRAW FOR PAIRED CHILD NODE / CHILD COMPONENT', {
          baseNode: node,
          baseComponent: component,
          currentNode: childNode,
          currentComponent: c,
        })
        // Redraw the child
        this.emit(componentEventMap.all, childNode, c)
        this.emit(componentEventMap[c?.noodlType], childNode, c)
      } else {
        log.grey(
          'WAS NOT ABLE TO FIND PAIRED CHILD NODE / CHILD COMPONENT FOR A REDRAW',
          {
            baseNode: node,
            baseComponent: component,
            currentNode: childNode,
            currentComponent: c,
          },
        )
      }
    })
  }

  /**
   * Returns true if key can exist as a property or method on a DOM node of tagName
   * @param { string } tagName - HTML tag
   * @param { string } key - Property of a DOM node
   */
  isValidAttr(tagName: T.NOODLDOMElementTypes, key: string) {
    if (key && tagName) {
      if (!this.#stub.elements[tagName]) {
        this.#stub.elements[tagName] = document.createElement(tagName)
      }
      return key in this.#stub.elements[tagName]
    }
    return false
  }

  /**
   * Takes an event name like "on.create" and returns the direct parent key
   * @param { string } eventName - Name of an event
   */
  #getEventKey = (eventName: T.NOODLDOMEvent) => {
    // TODO - Add more cases
    let eventKey: string | undefined
    if (eventName === 'component') return 'all'
    const fn = (type: string) => componentEventMap[type] === eventName
    eventKey = componentEventTypes.find(fn)
    return eventKey || ''
  }

  getAllCbs() {
    return this.#callbacks
  }

  removeAllCbs() {
    this.#callbacks.all.length = 0
    Object.keys(this.#callbacks.component).forEach((key) => {
      this.#callbacks.component[key].length = 0
    })
  }
}

export default NOODLUIDOM
