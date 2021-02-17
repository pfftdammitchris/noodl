import { expect } from 'chai'
import yaml, { createNode } from 'yaml'
import { YAMLMap } from 'yaml/types'
import flowRight from 'lodash/flowRight'
import fs from 'fs-extra'
import path from 'path'
import NoodlPage from '../NoodlPage'
import NoodlMorph from '../NoodlMorph'
import * as u from '../../../src/utils/common'

describe(u.coolGold('NoodlPage'), () => {
	it(
		`deeply nested nodes should be able to find out their page name ` +
			`they are associated with`,
		() => {
			const { EditProfile } = NoodlMorph.root
			NoodlMorph.visit(EditProfile, (args, util) => {
				if (util.isScalar(args.node)) {
					if (args.node.value === 'Contact Information') {
						const nodeAtPath = util.getPageWithPath(args.path)
						expect(nodeAtPath).to.be.instanceOf(NoodlPage)
						expect(nodeAtPath).to.have.property('name', 'EditProfile')
					}
				}
			})
		},
	)
})
