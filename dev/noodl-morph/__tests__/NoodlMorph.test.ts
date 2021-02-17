import { expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import yaml from 'yaml'
import globby from 'globby'
import NoodlMorph from '../NoodlMorph'
import NoodlPage from '../NoodlPage'
import * as docUtil from '../../../src/utils/doc'
import * as u from '../../../src/utils/common'

let ymlFileObjects = globby
	.sync(path.resolve(path.join(__dirname, '../../../output/server/**/*.yml')), {
		onlyFiles: true,
	})
	.map((filepath) => {
		const yml = fs.readFileSync(filepath, 'utf8')
		let name = filepath.substring(filepath.lastIndexOf('/') + 1)
		if (name.includes('.')) name = name.substring(0, name.lastIndexOf('.'))
		return { yml, name }
	})

let yml = fs.readFileSync(
	path.resolve(path.join(__dirname, './fixtures/VideoChat.yml')),
	'utf8',
)

let root
let page: NoodlPage

beforeEach(() => {
	root = ymlFileObjects.reduce(
		(acc, { yml, name }) =>
			Object.assign(acc, {
				[name]: NoodlMorph.createPage({ name, doc: yaml.parseDocument(yml) }),
			}),
		{},
	)
	NoodlMorph.root = root
	page = NoodlMorph.createPage({
		doc: yaml.parseDocument(yml),
		name: 'VideoChat',
	})
})

describe(u.coolGold('NoodlMorph'), () => {
	it(`should transform local references `, () => {
		NoodlMorph.visit(({ root, doc, key, node, path }, util) => {
			if (util.isScalar(node)) {
			}
		})

		// console.log(Object.keys(root))
	})
})
