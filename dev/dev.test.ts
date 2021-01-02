import { createNode } from 'yaml'
import { expect } from 'chai'
import chalk from 'chalk'
import * as noodlBlocks from 'noodl-building-blocks'
import { identify } from './dev'

const highlight = (...s: string[]) => chalk.yellow(...s)
const magenta = (...s: string[]) => chalk.magenta(...s)

describe(`identifiers`, () => {
	describe(`actions`, () => {
		it(`should be true if it has a ${highlight('goto')} property`, () => {
			expect(identify.action(createNode({ goto: 'hello' }))).to.be.true
		})
		xit(`should be true if it has an ${highlight('emit')} property`, () => {
			//
		})
		xit(`should be true if it has an ${highlight(
			'actionType',
		)} property`, () => {
			//
		})
	})

	describe(`action chains`, () => {
		xit(`should be true if there is a ${highlight('goto')} object`, () => {
			//
		})
		xit(`should be true if there is an ${highlight('emit')} object`, () => {
			//
		})
		xit(`should be true if the object has an ${highlight(
			'actionType',
		)} property`, () => {
			//
		})
	})
})
