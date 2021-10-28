import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import get from 'lodash/get.js'
import has from 'lodash/has.js'
import set from 'lodash/set.js'
import Aggregator from 'noodl-aggregator'
import yaml from 'yaml'
import fs from 'fs-extra'
import path from 'node:path'
import meow from 'meow'
import NoodlData from './NoodlData.js'
import NoodlMetadata from './NoodlMetadata.js'
import Actions from './Actions.js'
import Cache from './Cache.js'

const {
	isScalar,
	isPair,
	isMap,
	isSeq,
	isDocument,
	isNode,
	Node: YAMLNode,
	Scalar,
	Pair,
	parseDocument,
	Document: YAMLDocument,
	YAMLMap,
	YAMLSeq,
	visit,
	C,
} = yaml

const agg = new Aggregator('admind2')

;(async () => {
	try {
		await agg.init({
			dir: './generated/admind2',
			spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
		})

		for (const [name, doc] of agg.root) {
		}
	} catch (error) {
		if (error instanceof Error) throw error
		throw new Error(String(error))
	}
})()
