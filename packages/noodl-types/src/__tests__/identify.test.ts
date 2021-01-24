import chalk from 'chalk'
import { expect } from 'chai'
import { Identify } from '../Identify'

describe(chalk.keyword('orange')('Identify'), () => {
	describe.only(`actionChain`, () => {
		it.only(`should accept emit objects`, () => {
			expect(
				Identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
				]),
			).to.be.true
		})
		xit(`should accept goto objects`, () => {
			expect(
				Identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
					{ goto: 'PatientDashboard' },
					{ toast: { message: 'Hello' } },
				]),
			).to.be.true
		})

		xit(`should accept emit, goto, and toast objects`, () => {
			expect(
				Identify.actionChain([
					{ emit: { dataKey: { var1: 'itemObject' } }, actions: [] },
					{ goto: 'PatientDashboard' },
					{ toast: { message: 'Hello' } },
				]),
			).to.be.true
		})
	})

	describe(`toast`, () => {
		it(`should be a toast`, () => {
			expect(Identify.toast({ toast: { message: 'hello', style: {} } })).to.be
				.true
		})
		it(`should not be a toast`, () => {
			expect(Identify.toast({ toasft: { message: 'hello', style: {} } })).to.be
				.false
			expect(Identify.toast({})).to.be.false
			expect(Identify.toast('fasfas')).to.be.false
			expect(Identify.toast(5)).to.be.false
			expect(Identify.toast(null)).to.be.false
		})
	})
})
