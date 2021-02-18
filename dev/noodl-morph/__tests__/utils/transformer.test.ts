import { expect } from 'chai'
import fs from 'fs-extra'
import path from 'path'
import NoodlMorph from '../../NoodlMorph'
import { Scalar } from 'yaml/types'
import { NoodlPage } from '../../types'
import * as u from '../../../../src/utils/common'

describe(u.coolGold('transformers'), () => {
	describe(u.italic('dereferencing'), () => {
		it(`should dereference values from local root`, () => {
			const page = NoodlMorph.root.get('EditProfile') as NoodlPage
			const node = page.find((node: any) => node?.value === '..title')
			NoodlMorph.visit(node, NoodlMorph.util.transform)
			expect(node).to.have.property('value').to.eq('title123')
		})

		it(`should dereference values from root`, () => {
			const page = NoodlMorph.root.get('EditProfile') as NoodlPage
			const node = page.find(
				(node: any) =>
					node?.value === '.Global.currentUser.vertex.name.lastName',
			) as Scalar
			NoodlMorph.visit(node, NoodlMorph.util.transform)
			expect(node.value).to.eq('gonzalez')
		})
	})
})
