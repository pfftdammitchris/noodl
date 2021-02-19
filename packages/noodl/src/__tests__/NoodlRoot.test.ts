import { expect } from 'chai'
import { coolGold, italic } from 'noodl-common'
import NoodlVisitor from '../NoodlVisitor'

let visitor: NoodlVisitor

beforeEach(() => {
	visitor = new NoodlVisitor()
})

describe(coolGold('NoodlRoot'), () => {
	describe(italic('when iterating using the "for of" loop'), () => {
		it(`should pass the value in each loop as the top level property of the root cache`, () => {
			for (const [name, node] of visitor.root) {
				expect(node).to.eq(visitor.root.get(name))
			}
		})
	})
})
