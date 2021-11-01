import * as u from '@jsmanifest/utils'
import { loadFile, loadFiles, Visitor } from 'noodl'
import flowRight from 'lodash/flowRight.js'
import * as nt from 'noodl-types'
import * as nu from 'noodl-utils'
import * as fs from 'fs-extra'
import * as path from 'path'
import axios from 'axios'
import NoodlAggregator from 'noodl-aggregator'
import yaml from 'yaml'

const {
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
	Document: YAMLDocument,
	visit: YAMLVisit,
	visitorFn: YAMLVisitorFn,
} = yaml

const aggregator = new NoodlAggregator({
	config: 'meetd2',
	deviceType: 'web',
	dataType: 'object',
	env: 'test',
	version: 'latest',
	loglevel: 'info',
})

const result = await aggregator.init({
	dir: 'generated/meetd2',
	spread: ['BaseDataModel', 'BaseCSS', 'BasePage'],
})

const visitor = new Visitor()
visitor.root = aggregator.root

const visitorFns = flowRight(referenceVisitor, ({ key, node, path, meta }) => {
	console.log(meta)
	return node
})

for (const [name, node] of u.entries(visitor.root)) {
	visitor.visit(visitorFns, node)
}

function referenceVisitor({ key, node, path, root }) {
	if (isScalar(node)) {
		if (is.reference(node.value)) {
			//
		}
	}
	return node
}
