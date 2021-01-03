import chai, { expect } from 'chai'
import chalk from 'chalk'
import { actionTypes, componentTypes } from 'noodl-utils'
import chaiNoodl from '..'

chai.use(chaiNoodl)

before(() => {
	console.clear()
})

describe('chai-noodl', () => {
	describe(`action objects`, () => {
		actionTypes
			.filter((t) => !/(anonymous|emit|goto)/i.test(t))
			.forEach((actionType) => {
				it(`should be considered a ${chalk.yellow(actionType)} action`, () => {
					expect({ actionType }).to.be.a[actionType + 'Action']
				})
				it(`should not be considered a ${chalk.yellow(
					actionType,
				)} action`, () => {
					expect({ abc: 'hello', style: {} }).not.to.be.a(`${actionType}Action`)
				})
			})
	})

	describe(`component objects`, () => {
		componentTypes
			.filter((t) => !/(date)/i.test(t))
			.forEach((componentType) => {
				it(`should be considered a ${chalk.yellow(
					componentType,
				)} component`, () => {
					expect({ type: componentType, style: {} }).to.be.a[
						`${componentType}Component`
					]
				})
				it(`should not be considered a ${chalk.yellow(
					componentType,
				)} component`, () => {
					expect({ type: `huhf`, style: {} }).not.to.be.a(
						`${componentType}Component`,
					)
				})
			})
	})

	describe(`emit`, () => {
		it(`should be an emit object`, () => {
			expect({ emit: { dataKey: 'sfafs', actions: [] } }).to.be.an.emitObject
		})
		it(`should not be an emit object`, () => {
			expect({ eemit: { dataKey: 'sfafs', actions: [] } }).not.to.be.an
				.emitObject
		})
		it(`should not be an emit object`, () => {
			expect({ dataKey: 'sfafs', actions: [] }).not.to.be.an.emitObject
		})
		it(`should not be an emit object`, () => {
			expect('dsadasdsa').not.to.be.an.emitObject
		})
	})

	describe(`goto`, () => {
		it(`should be a goto object`, () => {
			expect({ goto: 'SignIn' }).to.be.a.gotoObject
		})
		it(`should not be an emit object`, () => {
			expect({ gggoto: { dataKey: 'sfafs', actions: [] } }).not.to.be.a
				.gotoObject
		})
		it(`should not be an emit object`, () => {
			expect({ emit: 'sfafs', actions: [] }).not.to.be.a.gotoObject
		})
		it(`should not be an emit object`, () => {
			expect('dsadasdsa').not.to.be.a.gotoObject
		})
	})

	describe(`styles`, () => {
		it(`should be a style object`, () => {
			expect({ border: { style: '2' } }).to.be.a.styleObject
		})
		it(`should be a style object`, () => {
			expect({ width: { style: '2' } }).to.be.a.styleObject
		})
		it(`should not be a style object`, () => {
			expect({ gggoto: { dataKey: 'sfafs', actions: [] } }).not.to.be.a
				.styleObject
		})
		it(`should not be a style object`, () => {
			expect({ style: 'sfafs', actions: [] }).not.to.be.a.styleObject
		})
		it(`should not be a style object`, () => {
			expect('dsadasdsa').not.to.be.a.styleObject
		})
		it(`should be a border style object`, () => {
			expect({ color: {} }).to.be.a.borderStyleObject
			expect({ width: {} }).to.be.a.borderStyleObject
			expect({ style: {} }).to.be.a.borderStyleObject
		})
	})
})
