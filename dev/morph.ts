process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as com from 'noodl-common'
import { Identify } from 'noodl-types'
import yaml from 'yaml'
import fs from 'fs-extra'
import Aggregator from '../src/api/Aggregator'
import pkg from '../package.json'
import aggregateActions from './aggregators/aggregateActions'
import aggregateReferences from './aggregators/aggregateReferences'
import * as co from '../src/utils/color'

const paths = {
	docs: com.getAbsFilePath('generated/test'),
	metadata: com.getAbsFilePath('data/generated/metadata.json'),
	typings: com.getAbsFilePath('data/generated/typings.d.ts'),
	stats: com.getAbsFilePath('data/generated/data.json'),
}

for (const [key, filepath] of u.entries(paths)) {
	paths[key] = com.normalizePath(filepath)
}

const aggregator = new Aggregator('meet4d')
const docFiles = com.loadFilesAsDocs({
	as: 'metadataDocs',
	dir: paths.docs,
	includeExt: false,
	recursive: true,
})

export const data = {
	actionTypes: {} as Record<
		string,
		{
			occurrences: number
			pages: Record<
				string,
				{ occurrences: number; values: { wrappedBy: string | null }[] }
			>
			totalPages: number
		}
	>,
	actionProperties: {} as Record<
		string,
		{
			isReference: boolean
			occurrences: number
			pages: Record<string, { occurrences: number }>
			totalPages: number
			wrappedBy?: string
			values: {
				page: string
				value: any
				isAbsoluteUrl?: boolean
				isActionChain?: boolean
				isAsset?: boolean
				isBoolean?: boolean
				isEmit?: boolean
				isGoto?: boolean
				isToast?: boolean
				references?: {
					total: number
					values: { value: string }[]
				}
			}[]
		}
	>,
	references: {},
}

function createGetReference(root: Aggregator['root']) {
	function _get(key: string) {
		if (Identify.reference(key)) {
			if (key.startsWith('..')) {
				const dataKey = key.strike
			} else if (key.startsWith('.')) {
				//
			} else if (key.startsWith('=')) {
				//
			} else if (key.startsWith('@')) {
				//
			}
		}
		return root.get(key)
	}
}

for (const { name, doc } of docFiles) {
	aggregator.root.set(name, doc)
	// aggregateActions({ name, doc, data })
	aggregateReferences({ name, doc, data })
}

Promise.resolve()
	.then(() => fs.writeJson(paths.stats, data, { spaces: 2 }))
	.then(() => u.log('\n' + co.green(`DONE`) + '\n'))
	.catch((err) => {
		throw err
	})
