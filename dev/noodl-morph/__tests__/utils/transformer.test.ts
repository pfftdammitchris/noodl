import { expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import getTransformer from '../../internal/transformers'
import NoodlMorph from '../../NoodlMorph'
import NoodlRoot from '../../NoodlRoot'
import * as u from '../../../../src/utils/common'

let transform: ReturnType<typeof getTransformer>

before(() => {
	transform = getTransformer({
		pages: NoodlMorph.pages,
		root: NoodlMorph.root,
	})
})

describe(u.coolGold('transformers'), () => {
	describe(u.italic('when parsing local references'), () => {
		it(`should set the correct value grabbed from local root`, (done) => {
			const page = NoodlMorph.root.get('EditProfile')
			NoodlMorph.visit(page, (args, util) => {
				if (util.isScalar(args.node)) {
					if (util.isLocalReference(args.node)) {
						if (args.node.value === '..title') {
							transform(args, util)
							expect(args.node.value).to.eq('title123')
							done()
						}
					}
				}
			})
		})
	})

	describe(`when parsing root references`, () => {
		it(`should set the correct value grabbed from root`, (done) => {
			const page = NoodlMorph.root.get('EditProfile')
			NoodlMorph.visit(page, (args, util) => {
				if (util.isScalar(args.node)) {
					if (args.node.value === '.Global.currentUser.vertex.name.lastName') {
						transform(args, util)
						expect(args.node.value).to.eq('gonzalez')
						done()
					}
				}
			})
		})
	})
})
