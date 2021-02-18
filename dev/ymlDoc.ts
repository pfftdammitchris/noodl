import chalk from 'chalk'
import yaml from 'yaml'
import globby from 'globby'
import fs from 'fs-extra'
import Identify from './noodl-morph/utils/Identify'
import NoodlVisitor, { Visitor } from './noodl-morph/NoodlVisitor'
import NoodlScalar from './noodl-morph/NoodlScalar'
import NoodlPair from './noodl-morph/NoodlPair'
import NoodlMap from './noodl-morph/NoodlMap'
import NoodlSeq from './noodl-morph/NoodlSeq'
import * as u from '../src/utils/common'

const root = globby.sync('output/server/**/*.yml').reduce((acc, filepath) => {
	let filename = filepath.substring(filepath.lastIndexOf('/') + 1)
	filename = filename.substring(0, filename.lastIndexOf('.'))
	acc[filename] = yaml.parseDocument(fs.readFileSync(filepath, 'utf8'))
	return acc
}, {} as { [key: string]: yaml.Document })

const visitor: Visitor = {
	visit: {
		Scalar(key, node, path) {
			if (node.isReference()) {
				// console.log(node)
			}
			if (typeof node.value === 'string' && node.value.endsWith('@')) {
				console.log(node.value)
			}
		},
		Pair(key, node, path) {
			//
		},
		Map(key, node, path) {
			if (node.isBuiltInAction()) {
				// console.log(`FOUND BUILT IN ACTION!!`, node.toJSON())
			}
		},
		Seq(key, node, path) {
			if (node.isActionChain()) {
				// console.log(`FOUND ACTION CHAIN!!`, node.toJSON())
			}
			if (node.isInit()) {
				// console.log('FOUND INIT', node.toJSON())
			}
		},
	},
}

// for (let [name, doc] of Object.entries(root)) {
// 	NoodlVisitor.visit(doc, visitor)
// }

NoodlVisitor.visit(
	yaml.parseDocument(fs.readFileSync('output/server/SignIn.yml', 'utf8')),
	visitor,
)
