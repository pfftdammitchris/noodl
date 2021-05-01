import { config } from 'dotenv'
import yaml from 'yaml'
config()
import chunk from 'lodash/chunk'
import fs from 'fs-extra'
import { YAMLNode } from '../types'
import * as u from '../utils/common'
import * as n from '../utils/noodl-utils'

export type ScriptObserver<DataLabel extends string = string> = (
	store: Store<DataLabel>,
) => ScriptObject<DataLabel>

export interface MetadataObject {
	page?: string
}

export type Store<DataLabel extends string = string> = Map<DataLabel, any>

export interface ScriptObject<DataLabel extends string = string> {
	label?: string
	cond?: 'scalar' | 'pair' | 'map' | 'seq' | ((node: YAMLNode) => boolean)
	key?: string
	fn: (
		store: Store<DataLabel>,
	) => (args: {
		key: number | 'key' | 'value'
		node: yaml.Document<any> | YAMLNode | null
		path: (yaml.Document<any> | YAMLNode | yaml.Pair<any, any>)[]
	}) => void
}

class Scripts<DataLabel extends string = string> {
	#store: Store<DataLabel> = new Map()
	#scripts = [] as ScriptObserver<DataLabel>[]
	#dataFilePath: string = ''
	#obs = { start: [], end: [] } as {
		start: ((store: Store) => void)[]
		end: ((store: Store) => void)[]
	}
	docs: yaml.Document[] = []

	constructor(opts: {
		dataFilePath: string
		store?: Store<DataLabel>
		docs?: yaml.Document | yaml.Document[]
	}) {
		this.#dataFilePath = opts.dataFilePath || ''
		opts.docs && u.array(opts.docs).forEach((doc) => this.docs.push(doc))
	}

	set dataFilePath(dataFilePath: string) {
		this.#dataFilePath = dataFilePath
		this.ensureDataFile()
	}

	get observers() {
		return this.#obs
	}

	compose(scripts: ScriptObserver<DataLabel> | ScriptObserver<DataLabel>[]) {
		const composed = (args: Parameters<ScriptObject['fn']>[0]) => {
			return u.array(scripts).map((obj) => obj(this.#store))
		}

		return composed
	}

	ensureDataFile() {
		if (!fs.existsSync(this.#dataFilePath)) {
			fs.ensureFileSync(this.#dataFilePath)
			fs.writeJsonSync(this.#dataFilePath, this.#store, { spaces: 2 })
			this.#store = this.get()
		}
	}

	get() {
		if (this.#dataFilePath) {
			try {
				return fs.readJsonSync(this.#dataFilePath)
			} catch (error) {
				console.error(error)
			}
		}

		return null
	}

	run() {
		this.#obs.start.forEach((fn) => fn(this.#store))
		const chunkedDocs = chunk(this.docs, 8)
		const composed = this.compose(this.#scripts)
		for (const docs of chunkedDocs) {
			const numDocs = docs?.length || 0
			for (let i = 0; i < numDocs; i++) {
				const doc = docs?.[i] as yaml.Document
				yaml.visit(doc, (key, node, path) => {
					composed({ key, node, path } as Parameters<ScriptObject['fn']>[0])
				})
			}
		}
		this.#obs.end.forEach((fn) => fn(this.#store))
		this.save()
	}

	serialize() {
		const serializedOutput = {} as Record<DataLabel, any>
		for (const [key, val] of this.#store.entries()) {
			serializedOutput[key] = val
		}
		return serializedOutput
	}

	save() {
		if (this.#dataFilePath) {
			try {
				fs.writeJsonSync(this.#dataFilePath, this.serialize(), {
					spaces: 2,
				})
			} catch (error) {
				console.error(error)
			}
		}
		return this.get()
	}

	use(opts: {
		script?: ScriptObserver<DataLabel> | ScriptObserver<DataLabel>[]
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
