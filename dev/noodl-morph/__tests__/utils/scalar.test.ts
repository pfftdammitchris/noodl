import { expect } from 'chai'
import { Scalar } from 'yaml/types'
import * as u from '../../../../src/utils/common'
import * as util from '../../utils/scalar'

describe(u.coolGold('Scalar utils'), () => {
	describe(u.italic('getPreparedKeyForDereference'), () => {
		const combos = [
			['..save', 'save'],
			['.builtIn.Hello,.abac1!@#f  a', 'builtIn.Hello,.abac1!@#f  a'],
			['   ..hello.123', 'hello.123'],
		] as const

		combos.forEach(([value, expectedResult]) => {
			it(`should return ${
				expectedResult || 'an empty string'
			} instead of ${value}`, () => {
				expect(util.getPreparedKeyForDereference(new Scalar(value))).to.eq(
					expectedResult,
				)
			})
		})
	})
})
