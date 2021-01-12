import chalk from 'chalk'
import isPlainObject from 'lodash/isPlainObject'
import find from 'lodash/find'
import merge from 'lodash/merge'
import { WritableDraft } from 'immer/dist/internal'
import { createDraft, isDraft, finishDraft, original, current } from 'immer'
import createComponentDraftSafely from './createComponentDraftSafely'
import isComponent from './isComponent'
import { ComponentType } from 'react'

interface PlainObject {
	[key: string]: any
}

// Current component events: 'path' attached by createSrc

const newComponent = <S extends new (...args: any[]) => any>(superclass: S) =>
	class extends superclass {
		#props: WritableDraft<PlainObject>
		type: ComponentType

		constructor(...args: any[]) {
			super(...args)
		}
	}

const mixin = <S extends new (...args: any[]) => any>(superclass: S) =>
	class extends superclass {}

class Component implements IComponent<any> {
	// This cache is used internally to cache original objects (ex: action objects)
	#cache: { [key: string]: any }
	#cb: { [eventName: string]: Function[] } = {}
	#cbIds: string[] = []
	#component: WritableDraft<ComponentObject> | ComponentObject
	#children: ComponentInstance[] = []
	#id: string = ''
	#noodlType: ComponentType
	#parent: ComponentInstance | null = null
	#status: 'drafting' | 'idle' = 'drafting'
	#stylesHandled: string[] = []
	#stylesUnhandled: string[] = []
	context: { [key: string]: any } = {}
	original: ComponentObject
	resolved: boolean = false
	keys: string[]
	handled: string[] = []
	unhandled: string[] = []
	touched: string[] = []
	untouched: string[] = []
	stylesTouched: string[] = []
	stylesUntouched: string[] = []

	constructor(component: ComponentCreationType) {
		const keys = isComponent(component)
			? component.keys
			: Object.keys(
					typeof component === 'string' ? { type: component } : component,
			  )
		this['original'] = isComponent(component)
			? component.original
			: typeof component === 'string'
			? { noodlType: component }
			: (component as any)
		this['keys'] = keys
		this['untouched'] = keys.slice()
		this['unhandled'] = keys.slice()

		this.#cache = {}
		this.#component = createComponentDraftSafely(
			component,
		) as WritableDraft<ComponentObject>

		this['id'] = this.#component.id || getRandomKey()
		this['noodlType'] = this.#component.noodlType as any

		if (!this.#component.style) this.#component['style'] = {}

		if (isPlainObject(this.#component.style)) {
			this.#stylesUnhandled = Object.keys(this.#component.style)
			this['stylesUntouched'] = this.#stylesUnhandled.slice()
		} else if (isDraft(this.#component.style)) {
			// this.#component.style = current(this.#component.style)
		}

		// Immer proxies these actions objects. Since we need this to be
		// in its original form, we will convert these back to the original form
		eventTypes.forEach((eventType) => {
			if (keys.includes(eventType)) {
				// If the cached handler is a function, it is caching a function that
				// was previously created internally. Since we need a reference to the
				// original action objects to re-create actions on-demand, we must
				// ensure that these are in their original form
				if (
					!this.#cache[eventType] ||
					typeof this.#cache[eventType] === 'function'
				) {
					this.#cache[eventType] = isDraft(this.#component[eventType])
						? original(this.#component[eventType])
						: this.#component[eventType]
				}
				// TODO - Find out more about how our code is using this around the app
				// this.action[eventType] = isDraft(component[eventType])
				//   ? original(component[eventType])
				//   : component[eventType]
			}
		})

		// Immer proxifies some funcs / objects but we need them in their original form
		// in the resolve process, so we need to convert them to their original form
		keys.forEach((key) => {
			if (isDraft(this.#component[key])) {
				const orig = original(this.#component[key])
				// this.#component[key] = original(this.#component[key])
				if (typeof this.original === 'object') {
					// this.original[key] = orig
				}
			}
		})
	}

	/**
	 * Returns the value of the component property using key, or
	 * Returns the value of the property of the component's style object
	 * using styleKey if key === 'style'
	 * @param { string } key - Component property or "style" if using styleKey for style lookups
	 */
	get<K extends keyof ComponentObject>(
		key: K | K[],
		styleKey?: keyof Style,
	): ComponentObject[K] | Record<K, ComponentObject[K]> | undefined {
		if (typeof key === 'string') {
			// Returns the original type
			// TODO - Deprecate component.noodlType since component.type is sufficient enough now
			if (key === 'type') return this.original.type as any
			const value = this.#retrieve(key, styleKey)
			return value
		}
		// component.get(['someKey', 'someOtherKey'])
		else if (Array.isArray(key)) {
			const value = {} as Record<K, ComponentObject[K]>
			key.forEach((k) => (value[k] = this.#retrieve(k)))
			return value
		}
	}

	/** Used by this.get */
	#retrieve = <K extends keyof ComponentObject | 'cache'>(
		key: K,
		styleKey?: keyof Style,
	) => {
		let value

		if (key === 'cache') {
			return this.#cache
		} else if (key === 'style') {
			// Retrieve the entire style object
			if (styleKey === undefined) {
				if (this.status !== 'drafting') this.touch('style')
				value = isDraft(this.original.style)
					? original(this.original.style)
					: this.original.style
			}
			// Retrieve a property of the style object
			else if (typeof styleKey === 'string') {
				if (this.status !== 'drafting') this.touchStyle(styleKey)
				value = this.original.style?.[styleKey]
			}
		} else {
			if (this.status !== 'drafting') this.touch(key as string)
			// Return the original type only for this case
			if (key === 'type') {
				value = this.original.type
			} else {
				value =
					this.#component[key as keyof ComponentObject] ||
					this.original[key as keyof ComponentObject]
			}
		}

		return isDraft(value) ? original(value) : value
	}

	/**
	 * Sets a property's value on the component, or sets a property's value on the style
	 * object if the key is "style", value is the styleKey and styleChanges is the value to update
	 * on the style object's styleKey
	 * @param { string } key - Key of component or "style" to update the style object using value
	 * @param { any? } value - Value to update key, or styleKey to update the style object if key === 'style'
	 * @param { any? } styleChanges - Value to set on a style object if key === 'style'
	 */
	set<K extends string = any>(key: K, value?: any, styleChanges?: any): this
	set<O extends ComponentObject>(key: O, value?: any, styleChanges?: any): this
	set<K extends string = any>(key: K, value?: any, styleChanges?: any) {
		if (key === 'style') {
			if (this.#component.style) {
				this.#component.style[value] = styleChanges
				if (!this.isHandled('style')) {
					this.#setHandledKey('style')
				}
				this.#setHandledStyleKey(value)
			}
		} else {
			if (key === 'type') this.#component['type'] = value
			else {
				this.#component[key as keyof ComponentObject] = value
				if (this.status !== 'drafting') this.#setHandledKey(key as string)
			}
		}
		return this
	}

	get contentType() {
		return this.#component.contentType
	}

	get id() {
		return this.#id || ''
	}

	set id(value: string) {
		this.#id = value
	}

	get type() {
		return this.#component?.type as ComponentType
	}

	get noodlType() {
		return this.#noodlType
	}

	set noodlType(value: ComponentType) {
		this.#noodlType = value
	}

	/** Returns the most recent styles at the time of this call */
	get style() {
		return (
			(isDraft(this.#component.style)
				? current(this.#component.style)
				: this.#component.style) || {}
		)
	}

	get status() {
		return isDraft(this.#status) ? current(this.#status) : this.#status
	}

	/**
	 * Turns the mode of this component to "drafting" state. This allows
	 * mutations to be set on this instance until .done() is called
	 */
	draft() {
		this.#status = 'drafting'
		this.#component = isDraft(this.#component)
			? this.#component
			: createDraft(this.#component)
		return this
	}

	/**
	 * Turns the mode of this component to 'idle' and sets this.resolved to true
	 * When the status is "idle", this component should not perform any mutation
	 * operations unless this.draft() is called
	 */
	done({ mergeUntouched = false } = {}) {
		if (this.status === 'drafting') {
			if (mergeUntouched) {
				this.untouched.forEach((untouchedKey) => {
					this.set(untouchedKey, this.#component[untouchedKey])
				})
			}
			// Prevent style keys that are not in valid DOM shapes from leaking to the DOM
			;([
				'border',
				'isHidden',
				'required',
				'shadow',
				'textColor',
			] as const).forEach((styleKey) => {
				this.removeStyle(styleKey)
			})
			this.#component = isDraft(this.#component)
				? finishDraft(this.#component)
				: this.#component
			this.#status = 'idle'
			if (Array.isArray(this.#cb.resolved)) {
				this.#cb.resolved.forEach((fn) => fn(this.#component))
			}
		}
		// this.resolved is meant to be set only once as soon as it has been set
		// to true the first time
		if (this.resolved === undefined) this['resolved'] = true
		return this
	}

	touch(key: string) {
		// Only operate on the props that this component was provided with
		if (this.keys.includes(key)) {
			if (!this.isTouched(key)) this.touched.push(key)
			const index = this.untouched.indexOf(key)
			if (index !== -1) this.untouched.splice(index, 1)
		}
		return this
	}

	isTouched(key: string) {
		return this.touched.includes(key)
	}

	touchStyle(styleKey: string) {
		if (!this.isStyleTouched(styleKey)) this.stylesTouched.push(styleKey)
		const index = this.stylesUntouched.indexOf(styleKey)
		if (index !== -1) this.stylesUntouched.splice(index, 1)
		return this
	}

	isStyleTouched(styleKey: string) {
		return this.stylesTouched.includes(styleKey)
	}

	isHandled(key: string) {
		return this.handled.includes(key)
	}

	isStyleHandled(styleKey: string) {
		return this.#stylesHandled.includes(styleKey)
	}

	#setHandledKey = (key: string) => {
		if (!this.isHandled(key)) this.handled.push(key)
		const index = this.unhandled.indexOf(key)
		if (index !== -1) this.unhandled.splice(index, 1)
		return this
	}

	#setHandledStyleKey = (styleKey: string) => {
		if (!this.isStyleHandled(styleKey)) this.#stylesHandled.push(styleKey)
		const index = this.#stylesUnhandled.indexOf(styleKey)
		if (index !== -1) this.#stylesUnhandled.splice(index, 1)
		return this
	}

	/**
	 * Merges values into a component's property using key or by using key as the incoming
	 * values to merge directly into the component props if it is an object,.
	 * You can also choose to merge into the style object if key === "style" and using
	 * value as the styles
	 * @param { string } key - Component property or "style" if using value to update the component's style object
	 * @param { object? } value - Object to merge into the component props (or into the component's style object if key === "style")
	 */
	assign(key: string | { [key: string]: any }, value?: { [key: string]: any }) {
		if (typeof key === 'string') {
			if (key === 'style') {
				if (typeof this.#component.style !== 'object') {
					log.func('assign')
					log.red(
						`Cannot assign style object properties to a type "${typeof this
							.#component.style}"`,
						{ key, value, style: this.#component.style },
					)
				} else {
					Object.assign(this.#component.style, value)
				}
			} else {
				Object.assign(this.#component[key], value)
			}
		} else if (isPlainObject(key)) {
			Object.assign(this.#component, key)
		}
		return this
	}

	/**
	 * Returns true if the key exists on the component, false otherwise.
	 * Returns true if the styleKey exists on the component's style object if key === 'style', false otherwise.
	 * @param { string } key - Component property or "style" if using styleKey for style lookups
	 * @param { string? } styleKey - Style property if key === 'style'
	 */
	has(key: string, styleKey?: keyof Style) {
		if (key === 'style') {
			if (typeof styleKey === 'string') {
				return styleKey in (this.#component.style || {})
			}
			return false
		}
		return key in (this.#component || {})
	}

	/**
	 * Merges value into the component's property using key, or merges value into the style object if key === "string",
	 * or merges props directly into the component if key is an object
	 * @param { string | object } key - Component property or "style" if merging into the style object, or an object of component props to merge directly into the component
	 */
	merge(key: string | { [key: string]: any }, value?: any) {
		if (typeof key === 'string') {
			if (key === 'style') {
				merge(this.#component.style, value)
			} else {
				merge(this.#component, value)
			}
		} else if (isPlainObject(key)) {
			merge(this.#component, key)
		}
		return this
	}

	/**
	 * Removes a component property, or removes a style property from the style object
	 * using styleKey if key === 'style'
	 * @param { string } key - Component property, or "style" if removing a style property using styleKey
	 */
	remove(key: string, styleKey?: keyof Style) {
		if (key === 'style' && typeof styleKey === 'string') {
			if (this.#component.style) {
				delete this.#component.style[styleKey]
			}
		} else {
			delete this.#component[key]
		}
		return this
	}

	/* -------------------------------------------------------
  ---- Syntax sugar for working with styles
-------------------------------------------------------- */

	/**
	 * Merges style props to the component's styles. Any styles with clashing names will be overridden
	 * @param { object } styles
	 */
	assignStyles(styles: Partial<Style>) {
		return this.assign('style', styles)
	}

	/**
	 * Retrieves a value from the style object using styleKey
	 * @param { string } styleKey
	 */
	getStyle<K extends keyof Style>(styleKey: K) {
		return this.#component.style?.[styleKey]
	}

	/**
	 * Returns true of the component is using the styleKey in its style objext
	 * @param { string } styleKey
	 */
	hasStyle<K extends keyof Style>(styleKey: K) {
		return this.has('style', styleKey)
	}

	/**
	 * Updates/creates a new key/value into the style object using the styleKey and value
	 * @param { string } styleKey
	 * @param { any } value - Value to set for the styleKey
	 */
	setStyle(styleKey: string, value: any): this
	setStyle<K extends keyof Style>(styles: K): this
	setStyle<K extends keyof Style>(styleKey: string | K, value?: any) {
		if (!this.#component.style) this.#component.style = {}
		if (typeof styleKey === 'string') {
			if (this.#component.style) {
				this.#component.style[styleKey] = value
				this.touchStyle(styleKey)
			}
		} else if (typeof styleKey === 'string') {
			const style = this.#component.style as Style
			forEachEntries(styleKey, (key, value) => {
				style[key] = value
			})
		}
		return this
	}

	/**
	 * Removes a property from the style object using the styleKey
	 * @param { string } styleKey
	 */
	removeStyle<K extends keyof Style>(styleKey: K) {
		this.remove('style', styleKey)
		return this
	}

	/**
	 * Returns the most recent
	 * component object at the time of this call.
	 * If it is still a draft it is converted into plain JS
	 */
	snapshot() {
		return Object.assign(
			{ id: this.#id, noodlType: this.original.type as ComponentType },
			this.toJS(),
			{
				_cache: this.#cache,
				_touched: this.touched,
				_untouched: this.untouched,
				_touchedStyles: this.stylesTouched,
				_untouchedStyles: this.stylesUntouched,
				_handled: this.handled,
				_unhandled: this.unhandled,
			},
		)
	}

	/** Returns the JS representation of the currently resolved component */
	toJS(): ComponentObject {
		const obj = isDraft(this.#component)
			? current(this.#component)
			: this.#component
		if (obj?.children) {
			return {
				...obj,
				id: this.id,
				children: this.children().map((child) => child?.toJS?.()),
			}
		}
		return obj as ComponentObject
	}

	/**
	 * Returns a stringified JSON object of the current component
	 * @param { number | undefined } spaces - Spaces to indent in the JSON string
	 */
	toString({ spaces = 2 }: { spaces?: number } = {}) {
		return JSON.stringify(this.toJS(), null, spaces)
	}

	parent() {
		return this.#parent as any
	}

	hasParent() {
		return !!this.#parent && isComponent(this.#parent)
	}

	setParent(parent: ComponentInstance | null) {
		this.#parent = parent
		return this
	}

	/**
	 * Returns a child at the index. Returns null if nothing was found.
	 * If an index is not passed in it will default to returning the
	 * first child or null otherwise
	 * @param { number } index
	 */
	child(index?: number) {
		if (!arguments.length) return this.#children?.[0]
		return this.#children?.[index as number]
	}

	/**
	 * Creates and appends the new child instance to the childrens list
	 * @param { IComponentType } props
	 */
	createChild<C extends ComponentInstance>(child: C): C {
		child?.setParent?.(this)
		this.#children.push(child)
		return child
	}

	/**
	 * Returns true if the child exists in the tree
	 * @param { ComponentInstance | string } child - Child component or id
	 */
	hasChild(child: string): boolean
	hasChild(child: ComponentInstance): boolean
	hasChild(child: ComponentInstance | string): boolean {
		if (typeof child === 'string') {
			return !!find(this.#children, (c) => c?.id === child)
		} else if (isComponent(child)) {
			return this.#children.includes(child)
		}
		return false
	}

	/**
	 * Removes a child from its children. You can pass in either the instance
	 * directly, the index leading to the child, the component's id, or leave the args empty to
	 * remove the first child by default
	 * @param { ComponentInstance | string | number | undefined } child - Child component, id, index, or no arg (to remove the first child by default)
	 */
	removeChild(index: number): ComponentInstance | undefined
	removeChild(id: string): ComponentInstance | undefined
	removeChild(child: ComponentInstance): ComponentInstance | undefined
	removeChild(): ComponentInstance | undefined
	removeChild(child?: ComponentInstance | number | string) {
		let removedChild: ComponentInstance | undefined
		if (!arguments.length) {
			removedChild = this.#children.shift()
		} else if (typeof child === 'number' && this.#children[child]) {
			removedChild = this.#children.splice(child, 1)[0]
		} else if (typeof child === 'string') {
			removedChild = child
				? find(this.#children, (c) => c.id === child)
				: undefined
		} else if (this.hasChild(child as ComponentInstance)) {
			if (this.#children.includes(child as ComponentInstance)) {
				this.#children = this.#children.filter((c) => {
					if (c === child) {
						removedChild = child
						return false
					}
					return true
				})
			}
		}
		return removedChild
	}

	children() {
		return this.#children || []
	}

	get length() {
		return this.#children?.length || 0
	}

	on(eventName: string, cb: Function, id: string = '') {
		if (id) {
			if (!this.#cbIds.includes(id)) this.#cbIds.push(id)
			else return this
		}

		if (!Array.isArray(this.#cb[eventName])) this.#cb[eventName] = []
		// log.func(`on [${this.noodlType}]`)
		// log.grey(`Subscribing listener for "${eventName}"`, this)
		this.#cb[eventName].push(cb)
		return this
	}

	off(eventName: any, cb: Function) {
		if (Array.isArray(this.#cb[eventName])) {
			if (this.#cb[eventName].includes(cb)) {
				log.func(`off [${this.noodlType}]`)
				log.grey(`Removing listener for "${eventName}"`, this)
				this.#cb[eventName].splice(this.#cb[eventName].indexOf(cb), 1)
			}
		}
		return this
	}

	emit(eventName: string, ...args: any[]) {
		this.#cb[eventName]?.forEach((fn) => fn(...args))
		return this
	}

	getCbs() {
		return this.#cb
	}

	hasCb(eventName: string, cb: Function) {
		return !!this.#cb[eventName]?.includes?.(cb)
	}

	clearCbs() {
		Object.keys(this.#cb).forEach((eventName) => {
			if (Array.isArray(this.#cb[eventName])) {
				this.#cb[eventName].length = 0
			}
		})
		return this
	}
}

export default Component

export function getRandomKey() {
	return `_${Math.random().toString(36).substr(2, 9)}`
}
