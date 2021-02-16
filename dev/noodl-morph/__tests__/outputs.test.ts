import { expect } from 'chai'
import { Scalar } from 'yaml/types'
import flowRight from 'lodash/flowRight'
import partialRight from 'lodash/partialRight'
import yaml from 'yaml'
import path from 'path'
import NoodlMorph from '../NoodlMorph'
import internalVisitors from '../internal/visitors'
import { createDocWithJsObject } from '../utils/test-utils'
import { NoodlVisitorFn, NoodlVisitorUtilsArgs } from '../NoodlVisitor'
import { isScalar, isPair, isYAMLMap, isYAMLSeq } from '../../../src/utils/doc'
import * as u from '../../../src/utils/common'
import * as docUtil from '../utils/doc'
import * as scalarUtil from '../utils/scalar'
import * as seqUtil from '../utils/seq'
import * as mapUtil from '../utils/map'

let VideoChat: yaml.Document.Parsed

before(() => {
	VideoChat = u.loadFileAsDoc(path.join(__dirname, './fixtures/VideoChat.yml'))
	NoodlMorph.createPage({ name: 'VideoChat', doc: VideoChat })
})

after(() => {
	NoodlMorph.clearRoot()
})

describe(u.coolGold('outputs'), () => {
	describe(`should be able to dereference a root reference`, () => {
		xit(``, () => {
			const doc = createDocWithJsObject({ hello: 'hehe' })
			NoodlMorph.createPage({ name: 'SignInCheck', doc })
			NoodlMorph.visit(doc, (ars, util) => {})
			//
		})
	})

	it(`should resolve ${u.fadedBlue('.SignInCheck')}`, () => {
		// NoodlMorph.visit(({ root, doc, key, node, path }, util) => {
		// 	if (node instanceof Scalar) {
		// 		if (util.isReference(node)) {
		// 			util.transform.reference({ doc, root }, node)
		// 		}
		// 	}
		// })
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

		function composeVisitors(...vs: NoodlVisitorFn[]) {
			const hofVisitors = vs.map((visitor) => partialRight(visitor, util))

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

		console.log(internalVisitors)
		console.log(internalVisitors)
		console.log(internalVisitors)
		console.log(internalVisitors)

		const composedVisitors = composeVisitors(
			flowRight(...Object.values(internalVisitors)),
		)

		const transform = composedVisitors(step)

		NoodlMorph.visit((args, util) => {
			composedVisitors(args)
		})
	})
})
