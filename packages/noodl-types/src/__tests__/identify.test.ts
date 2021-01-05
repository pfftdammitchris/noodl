import chalk from 'chalk'
import { expect } from 'chai'
import { identify } from '../identify'

describe(`identify`, () => {
	describe(`${chalk.keyword('hotpink')('toast')}`, () => {
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
