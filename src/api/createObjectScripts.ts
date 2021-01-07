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

const createObjectScripts = function (
	ymlDocs: yaml.Document | yaml.Document[],
) {
	let cbs = {
		start: [] as ((...args: any[]) => void)[],
		end: [] as ((...args: any[]) => void)[],
	}

	const o = {
		data() {
			return Array.isArray(ymlDocs) ? ymlDocs : [ymlDocs]
		},
		'noodl-types'<Store = any>({ pathToDataFile }: { pathToDataFile: string }) {
			fs.ensureFileSync(pathToDataFile)

			const _internal = {
				dataFile: {} as Store,
				observers: [] as NOODLTypesObserver[],
			}

			try {
				_internal.dataFile = JSON.parse(fs.readFileSync(pathToDataFile, 'utf8'))
			} catch (error) {
				fs.writeJsonSync(pathToDataFile, (_internal.dataFile = {} as Store), {
					spaces: 2,
				})
			}

			function save() {
				fs.writeJsonSync(pathToDataFile, _internal.dataFile, { spaces: 2 })
			}

			const composeNodeFns = (
				...fns: ((node: YAMLNode, store: Store) => any)[]
			) => {
				fns = fns.reverse()
				return (node: YAMLNode) =>
					fns.forEach((fn) => fn(node, _internal.dataFile))
			}

			const noodlTypes = {
				on(event: 'end' | 'start', fn: (store: Store) => void) {
					if (event === 'start') {
						if (!cbs.start.includes(fn)) cbs.start.push(fn)
					} else if (event === 'end') {
						if (!cbs.end.includes(fn)) cbs.end.push(fn)
					}
					return this
				},
				run({ scripts }: { scripts?: string[] } = {}) {
					cbs.start.forEach((fn) => fn(_internal.dataFile))
					const chunkedDocs = chunk(o.data(), 8)
					const numChunks = chunkedDocs.length
					const processFns = composeNodeFns(
						..._internal.observers.reduce((acc, obs) => {
							if (scripts?.includes?.(obs.id)) {
								return acc.concat(obs.fn)
							}
							return acc
						}, []),
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
				},
				use(obj: NOODLTypesObserver) {
					if (!_internal.observers.includes(obj)) {
						_internal.observers.push(obj)
					}
					return noodlTypes
				},
			}

			return noodlTypes
		},
	}

	return o
}

export default createObjectScripts
