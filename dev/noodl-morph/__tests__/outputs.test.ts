import { expect } from 'chai'
import { Scalar } from 'yaml/types'
import globby from 'globby'
import curry from 'lodash/curry'
import flowRight from 'lodash/flowRight'
import partialRight from 'lodash/partialRight'
import yaml from 'yaml'
import path from 'path'
import NoodlMorph from '../NoodlMorph'
import { createDocWithJsObject } from '../utils/test-utils'
import { NoodlVisitorFn, NoodlVisitorUtilsArgs } from '../NoodlVisitor'
import { isScalar, isPair, isYAMLMap, isYAMLSeq } from '../../../src/utils/doc'
import * as u from '../utils/internal'
import * as commonUtil from '../../../src/utils/common'
import * as docUtil from '../utils/doc'
import * as scalarUtil from '../utils/scalar'
import * as seqUtil from '../utils/seq'
import * as mapUtil from '../utils/map'

beforeEach(() => {
	commonUtil
		.loadFilesAsDocs({
			as: 'metadataDocs',
			dir: path.resolve(
				path.join(process.cwd(), 'dev/noodl-morph/__tests__/fixtures'),
			),
			recursive: false,
		})
		.forEach((obj) => {
			const name = obj.name.substring(0, obj.name.indexOf('.'))
			if (/(BaseCSS|BaseDataModel)/.test(name)) {
				NoodlMorph.insertToRoot({ key: name, value: obj.doc, spread: true })
			} else {
				NoodlMorph.createPage({ name, doc: obj.doc })
			}
		})
})

afterEach(() => {
	NoodlMorph.clearRoot()
})

describe(commonUtil.coolGold('outputs'), () => {
	describe(`should be able to dereference a root reference`, () => {
		xit(``, () => {
			const doc = createDocWithJsObject({ hello: 'hehe' })
			NoodlMorph.createPage({ name: 'SignInCheck', doc })
			NoodlMorph.visit(doc, (ars, util) => {})
			//
		})
	})

	it(`should resolve ${commonUtil.fadedBlue('.SignInCheck')}`, () => {
		let util: NoodlVisitorUtilsArgs = {
			isScalar,
			isPair,
			isMap: isYAMLMap,
			isSeq: isYAMLSeq,
			...docUtil,
			...scalarUtil,
			...mapUtil,
			...seqUtil,
		}

		const visit = partialRight(NoodlMorph.visit, (n, util) => {
			if (util.isScalar(n.node)) {
				if (util.isReference(n.node)) {
					let result = { before: n.node.toJSON() } as any
					if (util.isLocalReference(n.node)) {
						// result = n.doc.getIn(
						// 	util.getPreparedKeyForDereference(n.node).split('.'),
						// )
					} else if (util.isRootReference(n.node)) {
						const formattedKey = util.getPreparedKeyForDereference(n.node)
						const [rootKey, ...path] = formattedKey.split('.')

						// console.log(formattedKey + ' --> ', [rootKey, ...path])

						if (path.length) {
							if (n.pages.has(rootKey)) {
								result = n.pages.get(rootKey).getIn(path)
							} else if (rootKey === 'builtIn') {
								console.log(
									`Found a builtIn rootKey: ${commonUtil.italic(formattedKey)}`,
								)
							} else {
								result = n.root[rootKey]
								//
							}
						} else if (n.pages.has(rootKey)) {
							// result = n.pages.get(rootKey)
						} else if (rootKey === 'builtIn') {
							console.log(
								`Found a builtIn rootKey: ${commonUtil.italic(formattedKey)}`,
							)
							// result = formattedKey
						} else {
							// result = n.root[rootKey]
						}
						result && (result.after = n.node.toJSON())

						// console.log('result: ', result)
					} else if (util.isPopulateReference(n.node)) {
						//
					} else if (util.isTraverseReference(n.node)) {
						//
					}
				}
			}
		})

		function composeVisitors(...vs: NoodlVisitorFn[]) {
			const hofVisitors = vs.map((visitor) => visitor)

			function composeStepToVisitors(
				step: (acc: any, val: any) => any,
			): NoodlVisitorFn {
				return hofVisitors.reduceRight(
					(acc, visitor) => {
						return step(acc, visitor(acc))
					},
					(x) => x as any,
				)
			}

			return composeStepToVisitors
		}

		const step = (acc, v) => acc(v)

		const accumulator = (acc, val) => console.log(visit)

		visit()
	})
})
