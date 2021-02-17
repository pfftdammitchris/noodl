import { expect } from 'chai'
import yaml, { createNode } from 'yaml'
import { YAMLMap } from 'yaml/types'
import flowRight from 'lodash/flowRight'
import fs from 'fs-extra'
import path from 'path'
import NoodlPage from '../NoodlPage'
import NoodlMorph from '../NoodlMorph'
import NoodlRoot from '../NoodlRoot'
import * as u from '../../../src/utils/common'

describe(u.coolGold('NoodlRoot'), () => {
	describe(u.italic('when iterating using the "for of" loop'), () => {
		it(`should pass the value in each loop as the top level property of the root cache`, () => {
			for (const [name, node] of NoodlMorph.root) {
				expect(node).to.eq(NoodlMorph.root.get(name))
			}
		})
	})
})
