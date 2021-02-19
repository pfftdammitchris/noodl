import { YAMLMap } from 'yaml/types'
import { expect } from 'chai'
import path from 'path'

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
	describe(u.italic('getNodeFromRoot'), () => {
		it(`should get values from root`, () => {
			const style = v.getNodeFromRoot('Style') as YAMLMap
			expect(style).to.be.instanceOf(YAMLMap)
			const textAlign = v.getNodeFromRoot('Style.textAlign') as YAMLMap
			const textAlignJs = textAlign.toJSON()
			expect(textAlignJs).to.have.property('x', 'center')
			expect(textAlignJs).to.have.property('y', 'center')
			expect(textAlign.items).to.have.lengthOf(2)
			expect(v.getNodeFromRoot('Style.textAlign.y')).to.have.property(
				'value',
				'center',
			)
			expect(v.getNodeFromRoot('Style.textAlign.x')).to.have.property(
				'value',
				'center',
			)
		})

		xit(`should get the node from root`, () => {
			//
		})
	})
})
