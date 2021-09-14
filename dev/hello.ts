import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import * as nc from 'noodl-common'
import { curry } from 'lodash'
import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import NoodlAggregator from 'noodl-aggregator'
import {
	isNode,
	isScalar,
	isPair,
	isMap,
	isSeq,
	isDocument,
	Scalar,
	Pair,
	YAMLMap,
	YAMLSeq,
	Document as YAMLDocument,
	visit as YAMLVisit,
	visitorFn as YAMLVisitorFn,
} from 'yaml'

export type VisitorKey<N = any> = Parameters<YAMLVisitorFn<N>>[0]
export type VisitorNode<N = any> = Parameters<YAMLVisitorFn<N>>[1]
export type VisitorPath<N = any> = Parameters<YAMLVisitorFn<N>>[2]

process.env.NODE_ENV = 'development'

const aggregator = new NoodlAggregator('admind2')
const req = axios.create({
	baseURL: 'http://127.0.0.1:8080',
})

export const createGetByReference = curry(
	(localKey: string, datapath: string) => {
		const parts = datapath.split('.')
		const isRootKey = nt.Identify.localKey(datapath)
		const rootKey = isRootKey ? parts.shift() : localKey
		const node = aggregator.root.get(rootKey)
		if (!node) return null
		if (parts.length === 1 && parts[0] === '') return node.toJSON()
		if (isMap(node) || isDocument(node)) {
			const value = node.getIn(parts)
			return isNode(value) ? value.toJSON() : value
		}
		return node?.getIn?.(parts)?.toJSON?.()
	},
)

export function getParent<N = any>(paths: VisitorPath<N>[]) {
	if (paths.length > 1) {
		let parent = paths[paths.length - 2]
		if (parent) {
			if (isSeq(parent)) return paths[paths.length - 4]
			return parent
		}
	}
	return u.isUnd(paths[0]) ? null : paths[0]
}

async function start({ initialValues }) {
	try {
		const dir = path.resolve(path.join(process.cwd(), 'src/generated/admind2'))
		await aggregator.init({
			dir,
			loadPages: false,
			loadPreloadPages: true,
			spread: ['BaseDataModel', 'BasePage'],
		})

		if (u.isObj(initialValues)) {
			for (const [dataKey, value] of u.entries(initialValues)) {
				const datapath = nu.trimReference(dataKey)
				const dataparts = datapath.split('.')
				const doc = aggregator.root.get(dataKey)
				if (doc) {
					if (isDocument(doc) || isMap(doc)) {
						doc.setIn(dataparts, value)
					} else {
						u.throwError(
							'Attempted to initialize value on a non-document or non-map',
						)
					}
				} else {
					//
				}
			}
		}

		const references = []

		aggregator.root.delete('admind2_raw')
		aggregator.root.delete('cadlEndpoint_raw')

		for (const [label, doc] of aggregator.root) {
			const getByReference = createGetByReference(label)
			YAMLVisit(doc, {
				Pair(_, node, paths) {
					if (isScalar(node.key)) {
						const key = node.key.value
						if (u.isStr(key)) {
							if (nt.Identify.reference(key)) {
								const datapath = nu.trimReference(key) as string
								const dataparts = datapath.split('.')
								const isRoot = !nt.Identify.localKey(datapath)
								const value =
									getByReference(
										isRoot ? dataparts.slice(1).join('.') : datapath,
									) || null
								const data = {
									label,
									key,
									path: datapath.split('.'),
									root: isRoot,
									value,
									parent: getParent(paths),
								}
								references.push(data)
							}
						}
					}
				},
			})
		}

		// console.log([...aggregator.root.keys()])
		console.log(aggregator.root.size)
		await fs.writeJson('references.json', references, { spaces: 2 })
	} catch (error) {
		console.error(error)
		u.throwError(error)
	}
}

start({
	initialValues: {
		'Global.currentFacility': {
			id: 'vrk2oxClTYEdWH109ePFeA==',
			ctime: 1628078176,
			mtime: 1628078176,
			atime: 1628078176,
			atimes: 2,
			type: 20,
			name: {
				basicInfo: {
					medicalFacilityName: 'ahmucel550',
					specialty: '',
					phoneNumber: '+1 123123',
					introduction: '123123123123123123123',
					address: 'Anawan Road',
					unit: '123123123',
					city: 'North Attleboro',
					state: 'Massachusetts',
					zipCode: '02760',
					NPI: '123123123',
					DEANumber: '12312312',
					fullAddress: '',
					geoCode: [-71.34337105, 41.96990535],
					medicalLicense: '',
					medicalLicenseState: 'CA',
					fullInfo:
						'ahmucel550-Anawan Road, 123123123, North Attleboro, Massachusetts 02760',
					email: 'cehxnu2656@gmail.com',
					locationID: 'ahmucel550',
					businessLicense: '12312321',
					businessLicenseCity: '3123123123',
					location:
						'Anawan Road, 123123123, North Attleboro, Massachusetts 02760',
				},
			},
			esk: '',
			pk: 'VW/ceBN733d2oAki+muUeSAaKZBaE9SIbRJu5gBz40c=',
			uid: '',
			deat: null,
			tage: 0,
			rootNotebookID: 'iClZWbYIT6CYuUx05w4l7w==',
		},
	},
})

//
