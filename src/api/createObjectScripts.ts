import { config } from 'dotenv'
config()
import chunk from 'lodash/chunk'
import fs from 'fs-extra'
import yaml from 'yaml'
import { traverse } from '../utils/common'
import { YAMLNode } from '../types'

export interface NOODLTypesObserver<Store = any> {
	id?: string
	label?: string
	fn(node: YAMLNode, store: Store): void
}

const createObjectScripts = function <Store = any>({
	pathToDataFile,
	ymlDocs,
}: {
	pathToDataFile?: string
	ymlDocs?: yaml.Document | yaml.Document[]
} = {}) {
	let cbs = {
		start: [] as ((...args: any[]) => void)[],
		end: [] as ((...args: any[]) => void)[],
	}

	const _internal = {
		dataFile: {} as Store,
		observers: [] as NOODLTypesObserver[],
	}

	function onPathToDataFile() {
		fs.ensureFileSync(pathToDataFile as string)
		try {
			_internal.dataFile = JSON.parse(
				fs.readFileSync(pathToDataFile as string, 'utf8'),
			)
		} catch (error) {
			fs.writeJsonSync(
				pathToDataFile as string,
				(_internal.dataFile = {} as Store),
				{ spaces: 2 },
			)
		}
	}

	pathToDataFile && onPathToDataFile()

	function save() {
		pathToDataFile &&
			fs.writeJsonSync(pathToDataFile as string, _internal.dataFile, {
				spaces: 2,
			})
	}

	const composeNodeFns = (
		...fns: ((node: YAMLNode, store: Store) => any)[]
	) => {
		fns = fns.reverse()
		return (node: YAMLNode) => fns.forEach((fn) => fn(node, _internal.dataFile))
	}

	const o = {
		set pathToDataFile(filepath: string) {
			pathToDataFile = filepath
			onPathToDataFile()
		},
		/**
		 * Retrieves or sets the yml docs stored in state
		 * @param { yaml.Document | yaml.Document[] | undefined } ymlDocs - Parsed YAML documents
		 */
		data(docs?: yaml.Document | yaml.Document[]) {
			if (docs) {
				ymlDocs = Array.isArray(docs) ? docs : [docs]
			}
			return ymlDocs ? (Array.isArray(ymlDocs) ? ymlDocs : [ymlDocs]) : []
		},
		on(event: 'end' | 'start', fn: (store: Store) => void) {
			if (event === 'start') {
				if (!cbs.start.includes(fn)) cbs.start.push(fn)
			} else if (event === 'end') {
				if (!cbs.end.includes(fn)) cbs.end.push(fn)
			}

			return o
		},
		run() {
			if (!_internal.dataFile) _internal.dataFile = {} as Store
			cbs.start.forEach((fn) => fn(_internal.dataFile))
			const chunkedDocs = chunk(o.data(), 8)
			const numChunks = chunkedDocs.length
			const processFns = composeNodeFns(
				..._internal.observers.map(({ fn }) => fn),
			)
			for (let index = 0; index < numChunks; index++) {
				const docs = chunkedDocs[index]
				const numDocs = docs?.length || 0
				for (let i = 0; i < numDocs; i++) {
					traverse(processFns, docs?.[i] as yaml.Document)
				}
			}
			cbs.end.forEach((fn) => fn(_internal.dataFile))
			save()
			return o
		},
		use(obj: NOODLTypesObserver | NOODLTypesObserver[]) {
			if (obj) {
				;(Array.isArray(obj) ? obj : [obj]).forEach((o) => {
					if (!_internal.observers.includes(o)) {
						_internal.observers.push(o)
					}
				})
			}

			return o
		},
	}

	return o
}

export default createObjectScripts
