process.stdout.write('\x1Bc')
import * as u from '@jsmanifest/utils'
import * as nc from 'noodl-common'
import Aggregator from 'noodl-aggregator'
import { Identify } from 'noodl-types'
import yaml from 'yaml'
import fs from 'fs-extra'
import pkg from '../package.json'

const paths = {
	docs: nc.getAbsFilePath('generated/test'),
	metadata: nc.getAbsFilePath('data/generated/metadata.json'),
	typings: nc.getAbsFilePath('data/generated/typings.d.ts'),
	stats: nc.getAbsFilePath('data/generated/data.json'),
}

for (const [key, filepath] of u.entries(paths)) {
	paths[key] = nc.normalizePath(filepath)
}

const aggregator = new Aggregator('meet4d')
const docFiles = nc.loadFilesAsDocs({
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

const { name, doc } = docFiles[0]

const titlePair = doc.contents.items[0].value.items[2] as yaml.Pair
const viewComponentMap = doc.contents.items[0].value.items[3].value
	.items[0] as yaml.YAMLMap

// const alias = doc.createAlias(titlePair)

// doc.add(alias)

// console.log(doc.toString())

Promise.resolve()
	// .then(() => fs.writeJson(paths.stats, data, { spaces: 2 }))
	.then(() => u.log('\n' + nc.green(`DONE`) + '\n'))
	.catch((err) => {
		throw err
	})
