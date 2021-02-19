import { expect } from 'chai'
import { coolGold, italic } from 'noodl-common'
import { visitor } from '../../utils/test-utils'
import NoodlPage from '../../NoodlPage'

describe(coolGold('transformers'), () => {
	describe(italic('dereferencing'), () => {
		describe(`local references`, () => {
			it(`should dereference values from local root`, () => {
				const page = visitor.root.get('EditProfile') as NoodlPage
				const node = page.find((node: any) => node?.value === '..title')
				visitor.visit(node, visitor.utils().transform)
				expect(node).to.have.property('value').to.eq('title123')
			})
		})

		describe(`root references`, () => {
			it(`should dereference values from root`, () => {
				const page = visitor.root.get('EditProfile') as NoodlPage
				const node: any = page.find(
					(node: any) =>
						node?.value === '.Global.currentUser.vertex.name.lastName',
				)
				visitor.visit(node, visitor.utils().transform)
				expect(node.value).to.eq('gonzalez')
			})
		})

		describe(`application references`, () => {
			xit(``, () => {
				//
			})
		})
	})
})
