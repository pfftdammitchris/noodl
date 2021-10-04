import * as u from '@jsmanifest/utils'
import { Document as YAMLDocument, YAMLMap, YAMLSeq } from 'yaml'
import {
	loadFiles,
	LoadFilesOptions,
	LoadFilesAs,
	LoadType,
} from 'noodl-common'
import { YAMLNode } from './types/internalTypes'
import Page from './Page'

interface RootItems {
	[key: string]: Page | YAMLNode
}

class NoodlRoot<
	Type extends LoadType = 'yml',
	As extends LoadFilesAs = 'list',
> {
	#docs = {}
	options = {};

	[Symbol.iterator]() {
		let items = Object.entries(this.#docs)
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

	constructor(docs: YAMLDocument[])
	constructor(options: {
		docs: YAMLDocument[]
		loadOptions: Partial<LoadFilesOptions>
	})
	constructor(
		opts:
			| YAMLDocument[]
			| {
					docs: YAMLDocument[]
					loadOptions: Partial<LoadFilesOptions>
			  },
	) {
		if (u.isArr(opts)) {
			this.#docs = opts
		} else if (opts) {
			this.#docs = opts.docs
			this.options = opts.loadOptions
		}
	}

	get Global() {
		return this.#docs.Global as YAMLMap | undefined
	}

	get userVertex() {
		return this.Global?.getIn(['currentUser', 'vertex']) as YAMLMap | undefined
	}

	get(name?: never): RootItems
	get<Key extends string>(name: Key): RootItems[Key]
	get<Key extends string>(name?: Key | never) {
		if (!name || !u.isStr(name)) return this.#docs
		return this.#docs[name]
	}

	getIn(path: string | string[]) {
		if (!path) return
		const paths = Array.isArray(path) ? path : path.split('.').filter(Boolean)
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
		return key in this.#docs
	}

	set(opts: { key: string } & PropertyDescriptor, value?: never): this
	set(key: string, value: any): this
	set(opts: string | ({ key: string } & PropertyDescriptor), value?: any) {
		if (u.isObj(opts)) {
			const { key, get, set, ...rest } = opts
			Object.defineProperty(this.#docs, key, {
				configurable: true,
				enumerable: true,
				...rest,
				get: get?.bind(this),
				set: set?.bind(this),
			})
		} else if (u.isStr(opts)) {
			this.#docs[opts] = value
		}
		return this
	}

	clear() {
		Object.keys(this.#docs).forEach((key) => delete this.#docs[key])
	}
}

export default NoodlRoot
