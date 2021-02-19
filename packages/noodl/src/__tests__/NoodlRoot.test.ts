import { expect } from 'chai'

describe(u.coolGold('NoodlRoot'), () => {
	describe(u.italic('when iterating using the "for of" loop'), () => {
		it(`should pass the value in each loop as the top level property of the root cache`, () => {
			for (const [name, node] of NoodlMorph.root) {
				expect(node).to.eq(NoodlMorph.root.get(name))
			}
		})
	})
})
