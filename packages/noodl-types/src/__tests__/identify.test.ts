import chalk from 'chalk'
import { expect } from 'chai'
import { identify } from '../Identify'

describe(chalk.keyword('orange')('identify'), () => {
	describe.only(`actionChain`, () => {
		it.only(`should accept emit objects`, () => {
			expect(
				identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
				]),
			).to.be.true
		})
		xit(`should accept goto objects`, () => {
			expect(
				identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
					{ goto: 'PatientDashboard' },
					{ toast: { message: 'Hello' } },
				]),
			).to.be.true
		})

		xit(`should accept emit, goto, and toast objects`, () => {
			expect(
				identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
					{ goto: 'PatientDashboard' },
					{ toast: { message: 'Hello' } },
				]),
			).to.be.true
		})
	})

	describe(`toast`, () => {
		it(`should be a toast`, () => {
			expect(identify.toast({ toast: { message: 'hello', style: {} } })).to.be
				.true
		})
		it(`should not be a toast`, () => {
			expect(identify.toast({ toasft: { message: 'hello', style: {} } })).to.be
				.false
			expect(identify.toast({})).to.be.false
			expect(identify.toast('fasfas')).to.be.false
			expect(identify.toast(5)).to.be.false
			expect(identify.toast(null)).to.be.false
		})
	})
})
