import chalk from 'chalk'
import tds from 'transducers-js'
import { Identify } from '../identify'

export function identity<V>(value: V): V {
	return value
}

function wrap(fn) {
	return function (step) {
		return function (arg) {
			return fn(step(arg))
		}
	}
}

function compose(...fns: ((...args: any[]) => any)[]) {
	function reduceFns(arg) {
		return fns.reduceRight((acc, fn) => wrap(fn), arg)
	}
	return reduceFns
}

function step(args) {
	return args
}

const pred = (fn) => (step) => (acc, v) =>
	describe(chalk.keyword('navajowhite').italic(`_internal`), () => {
		it(``, () => {
			const hasEmitAndGotoAndPath = tds.comp(
				...[Identify.folds.emit, Identify.folds.goto, Identify.folds.path].map(
					wrap,
				),
			)(step)

			const result = hasEmitAndGotoAndPath({
				emit: { dataKey: { var1: 'hello' }, actions: [] },
				goto: 'CreateNewAccount',
				path: 'abc.png',
			})

			console.log(result)
		})
	})
