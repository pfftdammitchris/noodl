import { YAMLMap, YAMLSeq } from 'yaml/types'
import NoodlPage from './NoodlPage'
import { YAMLNode } from '../../src/types'
import * as u from './utils/internal'
import * as T from './types'

interface RootItems {
	[key: string]: NoodlPage | YAMLNode
}

class NoodlRoot<K extends keyof RootItems = keyof RootItems> {
	#items = {} as RootItems;

	[Symbol.iterator]() {
		let items = Object.entries(this.#items)
		let index = 0
		return {
			next() {
				return {
					done: index >= items.length,
					value: items[index++],
				}
			},
		}
	}

	get(name?: never): RootItems
	get<Key extends K>(name: Key): RootItems[K]
	get<Key extends K>(name?: Key | never) {
		if (!name || !u.isStr(name)) return this.#items
		return this.#items[name]
	}

	getIn(path: string | string[]) {
		if (!path) return
		const paths = Array.isArray(path) ? path : path.split('.')
		if (paths.length === 1) {
			return this.get(paths[0] as K)
		} else if (paths.length > 1) {
			const val = this.get(paths[0] as K)
			if (val instanceof YAMLMap) {
				return val.getIn(paths[1].slice(), true)
			} else if (val instanceof YAMLSeq) {
				return val.getIn(paths[1].slice(), true)
			}
			return val
		}
	}

	has(key: string) {
		return key in this.#items
	}

	set(opts: { key: string } & PropertyDescriptor, value?: never): this
	set(key: string, value: any): this
	set(opts: string | ({ key: string } & PropertyDescriptor), value?: any) {
		if (u.isObj(opts)) {
			const { key, get, set, ...rest } = opts
			Object.defineProperty(this.#items, key, {
				configurable: true,
				enumerable: true,
				...rest,
				get: get?.bind(this),
				set: set?.bind(this),
			})
		} else if (u.isStr(opts)) {
			this.#items[opts] = value
		}
		return this
	}

	clear() {
		Object.keys(this.#items).forEach((key) => delete this.#items[key])
	}
}

export default NoodlRoot
