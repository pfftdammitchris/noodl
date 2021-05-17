import chalk from 'chalk'
import { expect } from 'chai'
import * as t from '..'

const label = (s: string) => chalk.italic(chalk.white(s))

describe(chalk.keyword('navajowhite').italic('Identify'), () => {
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
		describe(`note`, () => {
			it(``, () => {
				const ecosObj: t.EcosDocument<any> = {
					name: {
						title: `note title`,
						data: `note's contents`,
						type: 'application/json',
					},
					subtype: { mediaType: 1 },
					type: 1025,
				}
				expect(t.Identify.ecosObj.note(ecosObj)).to.be.true
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
