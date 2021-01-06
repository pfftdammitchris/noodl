import { config } from 'dotenv'
config()
import chunk from 'lodash/chunk'
import fs from 'fs-extra'
import path from 'path'
import { traverse } from '../src/utils/common'
import { createObjectUtils } from './dev'
import { identify as ID } from './find'
import { YAMLNode } from './types'

function Scripts() {
	let cbs = {
		start: [] as ((...args: any[]) => void)[],
		end: [] as ((...args: any[]) => void)[],
	}

	const utils = {} as ReturnType<typeof createObjectUtils> & {
		identify: typeof ID
	}

	const o = {
		'noodl-types'<Store = any>({ rootDir }: { rootDir: string }) {
			const pathToDataFile = path.join(rootDir, 'src/data.json')
			const state = {
				dataFile: {} as Store,
			}

			fs.ensureFileSync(pathToDataFile)
			state.dataFile = fs.readFileSync(pathToDataFile, 'utf8') as any

			try {
				state.dataFile = JSON.parse(state.dataFile as any) || {}
			} catch (error) {
				fs.writeJsonSync(pathToDataFile, (state.dataFile = {} as Store), {
					spaces: 2,
				})
			}

			function save() {
				fs.writeJsonSync(pathToDataFile, state.dataFile, { spaces: 2 })
			}

			const composeNodeFns = (...fns) => {
				fns = fns.reverse()
				return (node) => fns.forEach((fn) => fn(node, state.dataFile))
			}

			const noodlTypes = {
				on(event: 'end' | 'start', fn: (store: typeof state.dataFile) => void) {
					if (event === 'start') {
						if (!cbs.start.includes(fn)) cbs.start.push(fn)
					} else if (event === 'end') {
						if (!cbs.end.includes(fn)) cbs.end.push(fn)
					}
					return this
				},
				run(
					...scriptFns: ((
						node: YAMLNode,
						store: typeof state.dataFile,
					) => any)[]
				) {
					cbs.start.forEach((fn) => fn(state.dataFile))
					const chunkedDocs = chunk(utils.data(), 8)
					const numChunks = chunkedDocs.length
					const processFns = composeNodeFns(...scriptFns)
					for (let index = 0; index < numChunks; index++) {
						const docs = chunkedDocs[index]
						const numDocs = docs.length
						for (let i = 0; i < numDocs; i++) {
							traverse(processFns, docs[i])
						}
					}
					cbs.end.forEach((fn) => fn(state.dataFile))
					save()
				},
			}
			return noodlTypes
		},
		use(mod: ReturnType<typeof createObjectUtils> | typeof ID) {
			if ('id' in mod) {
				if (mod.id === 'object.utils') {
					Object.assign(utils, mod)
				} else if (mod.id === 'identify') {
					utils.identify = mod as typeof ID
				}
			}
			return o
		},
	}

	return o
}

export default Scripts
