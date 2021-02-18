import { expect } from 'chai'
import Identify from '../utils/Identify'
import NoodlScalar from '../NoodlScalar'
import * as u from '../../../src/utils/common'
import { Scalar } from 'yaml/types'

describe(u.coolGold('Identify'), () => {
	describe(u.italic('references'), () => {
		describe('dot (.)', () => {
			describe('..formData.password', () => {
				const node = new NoodlScalar('..formData.password')

				it(`should be considered a local reference`, () => {
					expect(Identify.localReference(node)).to.be.true
				})

				it(`should not be considered a root reference`, () => {
					expect(Identify.rootReference(node)).to.be.false
				})
			})

			describe('.formData.password', () => {
				const node = new NoodlScalar('.formData.password')

				it(`should be considered as a local reference`, () => {
					expect(Identify.localReference(node)).to.be.true
				})

				it(`should not be considered as a root reference`, () => {
					expect(Identify.rootReference(node)).to.be.false
				})
			})

			describe('.Formdata.password', () => {
				const node = new NoodlScalar('.Formdata.password')

				it(`should not be considered as a root reference`, () => {
					expect(Identify.localReference(node)).to.be.false
				})

				it(`should be considered as a root reference`, () => {
					expect(Identify.rootReference(node)).to.be.true
				})
			})

			describe('..Formdata.password', () => {
				const node = new NoodlScalar('..FormData.password')

				it(`should not be considered as a local reference`, () => {
					expect(Identify.localReference(node)).to.be.false
				})

				it(`should be considered as a root reference`, () => {
					expect(Identify.rootReference(node)).to.be.true
				})
			})
		})

		describe(`underline reverse traversal (___)`, () => {
			const valid = [
				'.builtIn.__hello',
				'.builtIn.=._______hello',
				'builtIn.__h',
				'builtIn.__.__h',
			]
			const invalid = [
				'.builtIn.__.hello',
				'.builtIn.h__.hello',
				'.builtIn.h__hello',
				'.builtIn.=__hello',
				'.builtIn.=.hello',
				'.builtInhello',
				'builtIn.__.',
				'builtIn.__.__1',
				'builtIn___.',
			]

			valid.forEach((str) => {
				it(`should consider "${str}" as a traverse reference`, () => {
					const node = new Scalar(str)
					expect(Identify.traverseReference(node)).to.be.true
				})
			})

			invalid.forEach((str) => {
				it(`should not consider "${str}" as a traverse reference`, () => {
					const node = new Scalar(str)
					expect(Identify.traverseReference(node)).to.be.false
				})
			})
		})

		describe(`equal (=)`, () => {
			const valid = ['=.builtIn.=global', '    =.dasds']
			const invalid = [
				'.=',
				'=/',
				' =',
				'@=',
				'@email',
				'hello',
				'.    =sa',
				'=',
				'=.',
			]

			valid.forEach((s) => {
				it(`should consider "${s}" as an eval reference`, () => {
					const node = new Scalar(s)
					expect(Identify.evalReference(node)).to.be.true
				})
			})

			invalid.forEach((s) => {
				it(`should not consider "${s}" as an eval reference`, () => {
					const node = new Scalar(s)
					expect(Identify.evalReference(node)).to.be.false
				})
			})
		})

		describe(`at (@)`, () => {
			const valid = [
				'..appLink.url@',
				'.Global.currentUser.vertex.sk@',
				'.Global._nonce@',
				'..formData.checkMessage@',
			]

			const invalid = ['..@.', '@', 'hello@_']

			valid.forEach((s) => {
				it(`should consider "${s}" as a apply reference`, () => {
					const node = new Scalar(s)
					expect(Identify.applyReference(node)).to.be.true
				})
			})

			invalid.forEach((s) => {
				it(`should not consider "${s}" as a apply reference`, () => {
					const node = new Scalar(s)
					expect(Identify.applyReference(node)).to.be.false
				})
			})
		})
	})
})
