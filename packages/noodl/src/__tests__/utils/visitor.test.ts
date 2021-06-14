import { YAMLMap } from 'yaml'
import { expect } from 'chai'
import path from 'path'
import * as com from 'noodl-common'
import { noodl, visitor } from '../../utils/test-utils'

before(() => {
	com
		.loadFilesAsDocs({
			as: 'metadataDocs',
			dir: path.resolve(
				path.join(process.cwd(), 'dev/noodl-morph/__tests__/fixtures'),
			),
			recursive: false,
		})
		.forEach((obj: any) => {
			const name = obj.name.substring(0, obj.name.indexOf('.'))
			noodl.createPage({
				name,
				doc: obj.doc,
				spread: /(BaseCSS|BaseDataModel)/.test(name),
			})
		})
})

describe(com.coolGold('visitor utils'), () => {
	describe(com.italic('getValueFromRoot'), () => {
		it(`should get values from root`, () => {
			const v = visitor.utils()
			const style = v.getValueFromRoot('Style') as YAMLMap
			expect(style).to.be.instanceOf(YAMLMap)
			const textAlign = v.getValueFromRoot('Style.textAlign') as YAMLMap
			const textAlignJs = textAlign.toJSON()
			expect(textAlignJs).to.have.property('x', 'center')
			expect(textAlignJs).to.have.property('y', 'center')
			expect(textAlign.items).to.have.lengthOf(2)
			expect(v.getValueFromRoot('Style.textAlign.y')).to.have.property(
				'value',
				'center',
			)
			expect(v.getValueFromRoot('Style.textAlign.x')).to.have.property(
				'value',
				'center',
			)
		})

		xit(`should get the node from root`, () => {
			//
		})
	})
})
