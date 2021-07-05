// @ts-nocheck
import { expect } from 'chai'
import { coolGold } from 'noodl-common'
import { isScalar } from '../utils/internal'
import NoodlPage from '../Page'
import { noodl, visitor } from '../utils/test-utils'

describe(coolGold('NoodlPage'), () => {
	it(
		`deeply nested nodes should be able to find out their page name ` +
			`they are associated with`,
		() => {
			const EditProfile = noodl.root.get('EditProfile') as NoodlPage
			console.info(EditProfile)
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
