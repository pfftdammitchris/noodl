import yaml from 'yaml'
import { expect } from 'chai'
import { coolGold, italic } from 'noodl-common'
import { Pair, Scalar, YAMLMap } from 'yaml/types'
import { isScalar } from '../utils/internal'
import { dereferencer, noodl } from '../utils/test-utils'
import NoodlPage from '../Page'

describe(coolGold('Dereferencer'), () => {
	describe(`getLocalReference`, () => {
		it(`should dereference to the expected value`, () => {
			const ref = '..title'
			const page = noodl.root.get('EditProfile') as NoodlPage
			const node = page.find((node: any) => node?.value === ref)
			const result = dereferencer.getLocalReference(node as Scalar, { page })
			expect(result).to.eq('title123')
		})
	})

	describe(`getRootReference`, () => {
		it(`should dereference values from root`, () => {
			const lastName = 'gonzalez'
			const Global = noodl.root.Global
			const ref = '.Global.currentUser.vertex.name.lastName'
			Global.setIn('currentUser.vertex.name.lastName'.split('.'), lastName)
			const page = noodl.root.get('EditProfile') as NoodlPage
			const node = page.find((node: any) => node?.value === ref)
			const result = dereferencer.getRootReference(node)
			expect(result).to.eq(lastName)
		})
	})

	// describe(`Eval`, () => {
	// 	it.only(`should deference and evaluate`, () => {
	// 		const firstName = 'Adam'
	// 		const Global = dereferencer.root.Global
	// 		Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName)
	// 		const ref = '=..profileObject.name.data.firstName'
	// 		const page = dereferencer.createPage({
	// 			name: 'ABC',
	// 			doc: new yaml.Document({ hello: 'hehe' }),
	// 		})
	// 		const refNode = page.doc.createNode(ref, { wrapScalars: true })
	// 		page.doc.add(refNode)
	// 		const
	// 		// const ref = '=.Global.currentUser.vertex.name.firstName'
	// 		// const page = dereferencer.root.get('BaseDataModel') as NoodlPage
	// 		console.log('refNode', refNode)
	// 		transformer.transform(refNode)
	// 		expect(refNode).to.have.property('value', firstName)
	// 	})
	// })

	xdescribe(`Apply`, () => {
		let Global: YAMLMap
		let userVertex: YAMLMap
		let nameField: YAMLMap

		beforeEach(() => {
			Global = dereferencer.root.get('Global') as YAMLMap
			userVertex = dereferencer.root.userVertex
			nameField = dereferencer.root.userVertex.get('name')
		})

		it(`should apply the value to the path referenced in the key`, () => {
			const firstName = 'Bobby'
			const str = '.Global.currentUser.vertex.name.firstName@'
			const Global = dereferencer.root.Global
			Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName)
			const page = dereferencer.pages.get('EditProfile') as NoodlPage
			// prettier-ignore
			const pair = page.find((n) => u.isPair(n) && n.key.value === str) as Pair
			const applyRef = pair.key
			const evalRef = pair.value
			transformer.transform(pair)
			console.log('applyRef', applyRef)
			console.log('evalRef', evalRef)
			const key = ''
		})
	})

	describe(`Deeply nested dereferencing`, () => {
		it(`should be able to dereference through deeply nested references`, () => {
			const firstName = 'Michael'
			let Global = noodl.root.Global
			Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName)
			let EditProfile = noodl.pages.get('EditProfile')
			EditProfile.doc.add(
				EditProfile.doc.createPair('hehe', '.ABC.whatIsTheFirstName'),
			)
			const doc = new yaml.Document({ hello: 'hehe' })
			const pair = doc.createPair(
				'whatIsTheFirstName',
				'.DisplayProfile.profileObject.name.data.firstName',
			)
			noodl.createPage({ name: 'ABC', doc })
			doc.add(pair)
			const refNode = new Scalar('.EditProfile.hehe')
			expect(dereferencer.getReference(refNode.value)).to.eq(firstName)
		})
	})
})
