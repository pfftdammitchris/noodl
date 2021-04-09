import { config } from 'dotenv'
import yaml from 'yaml'
config()
import invariant from 'invariant'
import chunk from 'lodash/chunk'
import fs from 'fs-extra'
import { YAMLNode } from '../types'
import * as u from '../utils/common'

export interface ScriptObject<Store = any> {
	id?: string
	label?: string
	fn(node: YAMLNode, store: Store): void
}

class Scripts<Store = any> {
	#store = {} as Store
	#scripts = [] as ScriptObject[]
	#dataFilePath: string = ''
	#obs = { start: [], end: [] } as {
		start: ((store: Store) => void)[]
		end: ((store: Store) => void)[]
	}
	docs: yaml.Document[] = []

	constructor(opts: {
		dataFilePath: string
		store?: Store
		docs?: yaml.Document | yaml.Document[]
	}) {
		invariant(!!opts.dataFilePath, `Missing "dataFilePath argument"`)
		this.#dataFilePath = opts.dataFilePath || ''
		if (opts.docs) {
			u.array(opts.docs).forEach((doc) => this.docs.push(doc))
		}
		opts.store && (this.#store = opts.store)
	}

	get observers() {
		return this.#obs
	}

	set dataFilePath(dataFilePath: string) {
		this.#dataFilePath = dataFilePath
		this.ensureDataFile()
	}

	compose(...fns: ((node: YAMLNode, store: Store) => any)[]) {
		fns = fns.reverse()
		return (node: YAMLNode) => fns.forEach((fn) => fn(node, this.#store))
	}

	ensureDataFile() {
		if (!fs.existsSync(this.#dataFilePath)) {
			fs.ensureFileSync(this.#dataFilePath)
			fs.writeJsonSync(this.#dataFilePath, this.#store, { spaces: 2 })
			this.#store = this.get()
		}
	}

	get() {
		try {
			return fs.readJsonSync(this.#dataFilePath)
		} catch (error) {
			console.error(error)
		}
		return null
	}

	save() {
		try {
			fs.writeJsonSync(this.#dataFilePath, this.#store, { spaces: 2 })
		} catch (error) {
			console.error(error)
		}
		return this.get()
	}

	run() {
		this.#obs.start.forEach((fn) => fn(this.#store))
		const chunkedDocs = chunk(this.docs, 8)
		const processFns = this.compose(...this.#scripts.map(({ fn }) => fn))
		for (const docs of chunkedDocs) {
			const numDocs = docs?.length || 0
			for (let i = 0; i < numDocs; i++) {
				yaml.visit(docs?.[i] as yaml.Document, (key, node, path) => {
					processFns(node)
				})
			}
		}
		this.#obs.end.forEach((fn) => fn(this.#store))
		this.save()
	}

	use(opts: {
		script?: ScriptObject | ScriptObject[]
		start?: ((store: Store) => void) | ((store: Store) => void)[]
		end?: ((store: Store) => void) | ((store: Store) => void)[]
	}) {
		opts.script && this.#scripts.push(...u.array(opts.script))
		opts.start && this.#obs.start.push(...u.array(opts.start))
		opts.end && this.#obs.end.push(...u.array(opts.end))
		return this
	}
}

export default Scripts
