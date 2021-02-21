import { expect } from 'chai'
import { coolGold, italic } from 'noodl-common'
import { noodl } from '../utils/test-utils'

describe(coolGold('NoodlRoot'), () => {
	// describe(italic('Global'), () => {
	// 	describe(`When using the user vertex api`, () => {
	// 		describe(`setglobalPathToUserVertex`, () => {
	// 			xit(`should set the path to the user object`, () => {
	// 				//
	// 			})
	// 		})

	// 	})
	// })

	describe('when iterating using the "for of" loop', () => {
		it(`should pass the value in each loop as the top level property of the root cache`, () => {
			for (const [name, node] of noodl.root) {
				expect(node).to.eq(noodl.root.get(name))
			}
		})
	})
})
