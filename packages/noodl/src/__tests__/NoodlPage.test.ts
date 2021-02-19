import { expect } from 'chai'
import { coolGold } from 'noodl-common'
import { isScalar } from '../utils/internal'
import NoodlPage from '../NoodlPage'
import NoodlVisitor from '../NoodlVisitor'

let visitor: NoodlVisitor

beforeEach(() => {
	visitor = new NoodlVisitor()
})

describe(coolGold('NoodlPage'), () => {
	it(
		`deeply nested nodes should be able to find out their page name ` +
			`they are associated with`,
		() => {
			const EditProfile = visitor.root.get('EditProfile')
			visitor.visit(EditProfile, (args, util) => {
				if (isScalar(args.node)) {
					if (args.node.value === 'Contact Information') {
						// const nodeAtPath = getPageWithPath(args.path)
						// expect(nodeAtPath).to.be.instanceOf(NoodlPage)
						// expect(nodeAtPath).to.have.property('name', 'EditProfile')
					}
				}
			})
		},
	)
})
