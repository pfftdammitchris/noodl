import * as com from 'noodl-common'
import { expect } from 'chai'
import * as t from '..'

const label = (s: string) => com.italic(com.white(s))

describe(com.coolGold('Identify'), () => {
	describe(label('actionChain'), () => {
		it(`should accept emit objects`, () => {
			expect(
				t.Identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
				]),
			).to.be.true
		})

		it(`should accept goto objects`, () => {
			expect(
				t.Identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
					{ goto: 'PatientDashboard' },
					{ toast: { message: 'Hello' } },
				]),
			).to.be.true
		})

		it(`should accept emit, goto, and toast objects`, () => {
			expect(
				t.Identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
					{ goto: 'PatientDashboard' },
					{ toast: { message: 'Hello' } },
				]),
			).to.be.true
		})
	})

	describe(label('ecosObj'), () => {
		describe(`note/pdf`, () => {
			it(`should return true for note/pdf docs`, () => {
				const ecosObj: t.EcosDocument<any> = {
					name: {
						title: `note title`,
						data: `note's contents`,
						type: 'application/json',
					},
					subtype: { mediaType: 1 },
					type: 1025,
				}
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.true
			})

			it(`should return false for docs that are not note/pdf docs`, () => {
				const ecosObj: t.EcosDocument<any> = {
					name: {
						title: `note title`,
						data: `note's contents`,
						type: 'text/plain',
					},
					subtype: { mediaType: 1 },
					type: 1025,
				}
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
				ecosObj.name.type = 'application/pdf'
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
				ecosObj.name.type = 'text/html'
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
				ecosObj.name.type = 'text/markdown'
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
				ecosObj.name.type = 'text/javascript'
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
				ecosObj.name.type = 'image/png'
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
				ecosObj.name.type = 'image/jpg'
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
				ecosObj.name.type = 'video/mp4'
				expect(t.Identify.ecosObj.doc(ecosObj)).to.be.false
			})
		})
	})

	describe(label('toast'), () => {
		it(`should be a toast`, () => {
			expect(t.Identify.folds.toast({ toast: { message: 'hello', style: {} } }))
				.to.be.true
		})
		it(`should not be a toast`, () => {
			expect(
				t.Identify.folds.toast({ toasft: { message: 'hello', style: {} } }),
			).to.be.false
			expect(t.Identify.folds.toast({})).to.be.false
			expect(t.Identify.folds.toast('fasfas')).to.be.false
			expect(t.Identify.folds.toast(5)).to.be.false
			expect(t.Identify.folds.toast(null)).to.be.false
		})
	})
})
