import { expect } from 'chai'
import { Scalar } from 'yaml/types'
import { NoodlPage } from '../../types'

describe(u.coolGold('transformers'), () => {
	describe(u.italic('dereferencing'), () => {
		describe(`local references`, () => {
			it(`should dereference values from local root`, () => {
				const page = NoodlMorph.root.get('EditProfile') as NoodlPage
				const node = page.find((node: any) => node?.value === '..title')
				NoodlMorph.visit(node, NoodlMorph.util.transform)
				expect(node).to.have.property('value').to.eq('title123')
			})
		})

		describe(`root references`, () => {
			it(`should dereference values from root`, () => {
				const page = NoodlMorph.root.get('EditProfile') as NoodlPage
				const node = page.find(
					(node: any) =>
						node?.value === '.Global.currentUser.vertex.name.lastName',
				) as Scalar
				NoodlMorph.visit(node, NoodlMorph.util.transform)
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
