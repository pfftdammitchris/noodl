import { expect } from 'chai'
import yaml, { createNode } from 'yaml'
import { YAMLMap } from 'yaml/types'
import flowRight from 'lodash/flowRight'
import fs from 'fs-extra'
import path from 'path'
import NoodlPage from '../NoodlPage'
import NoodlMorph from '../NoodlMorph'
import { createDocWithJsObject } from '../utils/test-utils'
import * as u from '../../../src/utils/common'

let page: NoodlPage
let yml = fs.readFileSync(
	path.resolve(path.join(__dirname, './fixtures/VideoChat.yml')),
	'utf8',
)

beforeEach(() => {
	page = new NoodlPage(yaml.parseDocument(yml))
})

describe(u.coolGold('NoodlPage'), () => {
	describe(u.italic('transform'), () => {
		it(`should parse local references`, () => {
			page = new NoodlPage(
				createDocWithJsObject({
					object: {
						roomInfo: { response: { edge: { id: 'myid123' } } },
						components: [
							{ type: 'label', text: '..roomInfo.response.edge.id' },
							{ type: 'button', placeholder: '..hello' },
						],
					},
				}),
			)
			page.name = 'VideoChat'
			const references = page.getReferences()
			page.transform()
			console.log(JSON.stringify(page, null, 2))
		})
	})
})
