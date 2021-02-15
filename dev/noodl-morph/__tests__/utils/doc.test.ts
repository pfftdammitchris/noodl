import { expect } from 'chai'
import yaml from 'yaml'
import { Scalar, YAMLMap, YAMLSeq } from 'yaml/types'
import fs from 'fs-extra'
import path from 'path'
import NoodlPage from '../../NoodlPage'
import * as u from '../../../../src/utils/common'
import * as d from '../../utils/doc'

let page: NoodlPage
let yml = fs.readFileSync(
	path.resolve(path.join(__dirname, '../fixtures/VideoChat.yml')),
	'utf8',
)

beforeEach(() => {
	page = new NoodlPage(yaml.parseDocument(yml))
	page.name = 'VideoChat'
})

describe(u.coolGold('YAML Document utils'), () => {
	describe(u.italic('getReference'), () => {
		describe(`localReference`, () => {
			it(`should be able to retrieve "..roomInfo.edgeAPI.store" (object)`, () => {
				const value = '..roomInfo.edgeAPI.store'
				expect(d.getReference.call(page, value)).to.be.instanceOf(YAMLMap)
			})

			it(`should be able to retrieve "..micOn" (yml boolean)`, () => {
				const value = '..micOn'
				expect(d.getReference.call(page, value)).to.have.property(
					'value',
					'true',
				)
			})

			it(`should be able to retrieve "..roomInfo.edge.type" (number)`, () => {
				const value = '..roomInfo.edge.type'
				expect(d.getReference.call(page, value)).to.have.property(
					'value',
					40000,
				)
			})

			it(`should be able to retrieve "..save" (array --> object)`, () => {
				const value = '..save'
				const result = d.getReference.call(page, value) as YAMLSeq
				expect(result).to.be.instanceOf(YAMLSeq)
				expect(result.items).to.have.lengthOf(1)
				expect(result.get(0)).to.eq('..roomInfo.edgeAPI.store')
			})
		})

		describe(`rootReference`, () => {
			xit(``, () => {
				//
			})
		})

		describe(`populateReference`, () => {
			xit(``, () => {
				//
			})
		})

		describe(`traverseReference`, () => {
			xit(``, () => {
				//
			})
		})
	})

	describe.only(u.italic('transformers'), () => {
		describe('Scalar', () => {
			it(`should set the value to the value the reference points to`, () => {
				const node = new Scalar('..roomInfo.edgeAPI.store.api')
				d.transform.reference(page.doc, node)
				expect(node.value).to.eq('ce')
			})
		})
	})
})
