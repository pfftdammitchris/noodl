import { expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import getVisitorUtils from '../../utils/visitor'
import NoodlMorph from '../../NoodlMorph'
import * as u from '../../../../src/utils/common'

let v: ReturnType<typeof getVisitorUtils>

before(() => {
	u.loadFilesAsDocs({
		as: 'metadataDocs',
		dir: path.resolve(
			path.join(process.cwd(), 'dev/noodl-morph/__tests__/fixtures'),
		),
		recursive: false,
	}).forEach((obj) => {
		const name = obj.name.substring(0, obj.name.indexOf('.'))
		NoodlMorph.createPage({
			name,
			doc: obj.doc,
			spread: /(BaseCSS|BaseDataModel)/.test(name),
		})
	})
	v = getVisitorUtils({ pages: NoodlMorph.pages, root: NoodlMorph.root })
})

after(() => {
	NoodlMorph.clearRoot()
})

describe(u.coolGold('visitor utils'), () => {
	describe(u.italic('getNodeAtLocalOrRoot'), () => {
		it(`should get the node from local root`, () => {
			const result = v.getNodeAtLocalOrRoot('')
			console.log(result)
		})

		xit(`should get the node from root`, () => {
			//
		})
	})
})
