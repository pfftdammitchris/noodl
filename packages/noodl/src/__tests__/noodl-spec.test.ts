/**
 * This file contains unit tests that ensures nodes are able to resolve
 * values from the AST corresponding to the NOODL spec
 */
import yaml from 'yaml'
import sinon from 'sinon'
import { expect } from 'chai'
import { coolGold, italic } from 'noodl-common'
import { noodl } from '../utils/test-utils'
import { Pair, Scalar, YAMLMap } from 'yaml/types'
import NoodlPage from '../Page'
import NoodlRoot from '../Root'
import NoodlUtils from '../Utils'
import Transformer, { _noodlSpecTransformers } from '../Transformer'
import * as T from '../types'
import * as u from '../utils/internal'

let transformer: Transformer

beforeEach(() => {
	transformer = new Transformer({ pages: noodl.pages, root: noodl.root })
	Object.values(_noodlSpecTransformers).forEach(
		transformer.createTransform.bind(transformer),
	)
})

describe(coolGold('NOODL Specification'), () => {
	describe(`Composing transformers`, () => {
		// xit(`should compose transformers into the transducer`, () => {
		// 	const ref = {
		// 		local: new Transform('local', transform.reference.local),
		// 		root: new Transform('root', transform.reference.root),
		// 		apply: new Transform('apply', transform.reference.apply),
		// 	}
		// 	const localSpy = sinon.spy(ref.local, 'execute', ['get'])
		// 	const rootSpy = sinon.spy(ref.root, 'execute', ['get'])
		// 	const applySpy = sinon.spy(ref.apply, 'execute', ['get'])
		// 	transformer
		// 		.createTransform(ref.local)
		// 		.createTransform(ref.root)
		// 		.createTransform(ref.apply)
		// 	expect(localSpy.get.calledOnce)
		// 	expect(rootSpy.get.calledOnce)
		// 	expect(applySpy.get.calledOnce)
		// 	expect(transformer.transform).to.be.a('function')
		// 	localSpy.get.restore?.()
		// 	rootSpy.get.restore?.()
		// 	applySpy.get.restore?.()
		// })
	})

	describe(italic('References'), () => {
		describe(`Local`, () => {
			it(`should dereference to the expected value`, () => {
				const ref = '..title'
				const page = noodl.root.get('EditProfile') as NoodlPage
				const node = page.find((node: any) => node?.value === ref)
				transformer.transform(node)
				expect(node).to.have.property('value').to.eq('title123')
			})
		})

		describe(`Root`, () => {
			it(`should dereference values from root`, () => {
				const lastName = 'gonzalez'
				const Global = noodl.root.Global
				const ref = '.Global.currentUser.vertex.name.lastName'
				Global.setIn('currentUser.vertex.name.lastName'.split('.'), lastName)
				const page = noodl.root.get('EditProfile') as NoodlPage
				const node = page.find((node: any) => node?.value === ref)
				transformer.transform(node)
				expect(node).to.have.property('value', lastName)
			})
		})

		// describe(`Eval`, () => {
		// 	it.only(`should deference and evaluate`, () => {
		// 		const firstName = 'Adam'
		// 		const Global = noodl.root.Global
		// 		Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName)
		// 		const ref = '=..profileObject.name.data.firstName'
		// 		const page = noodl.createPage({
		// 			name: 'ABC',
		// 			doc: new yaml.Document({ hello: 'hehe' }),
		// 		})
		// 		const refNode = page.doc.createNode(ref, { wrapScalars: true })
		// 		page.doc.add(refNode)
		// 		const
		// 		// const ref = '=.Global.currentUser.vertex.name.firstName'
		// 		// const page = noodl.root.get('BaseDataModel') as NoodlPage
		// 		console.log('refNode', refNode)
		// 		transformer.transform(refNode)
		// 		expect(refNode).to.have.property('value', firstName)
		// 	})
		// })

		describe(`Apply`, () => {
			let Global: YAMLMap
			let userVertex: YAMLMap
			let nameField: YAMLMap

			beforeEach(() => {
				Global = noodl.root.get('Global') as YAMLMap
				userVertex = noodl.root.userVertex
				nameField = noodl.root.userVertex.get('name')
			})

			it(`should apply the value to the path referenced in the key`, () => {
				const firstName = 'Bobby'
				const str = '.Global.currentUser.vertex.name.firstName@'
				const Global = noodl.root.Global
				Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName)
				const page = noodl.pages.get('EditProfile') as NoodlPage
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

		it(`should be able to dereference through deeply nested references`, () => {
			const firstName = 'Adam'
			const Global = noodl.root.Global
			const EditProfile = noodl.pages.get('EditProfile')
			Global.setIn('currentUser.vertex.name.firstName'.split('.'), firstName)
			const editProfilePair = EditProfile.doc.createPair(
				'hehe',
				'ABC.whatIsTheFirstName',
			)
			EditProfile.doc.add(editProfilePair)
			const doc = new yaml.Document({ hello: 'hehe' })
			const page = noodl.createPage({ name: 'ABC', doc })
			const abcPair = page.doc.createPair(
				'whatIsTheFirstName',
				'.DisplayProfile.profileObject.name.data.firstName',
			)
			doc.add(abcPair)
			const refNode = new Scalar('.ABC.whatIsTheFirstName')
			transformer.transform(refNode)
			expect(refNode).to.have.property('value', firstName)
		})
	})
})
