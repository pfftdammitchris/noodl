import { expect } from 'chai'
import { coolGold, italic, magenta } from 'noodl-common'
import chalk from 'chalk'
import sinon from 'sinon'
import Action from '../Action'
import ActionChain from '../ActionChain'
import AbortExecuteError from '../AbortExecuteError'
import { ABORTED, IDLE } from '../constants'
import {
	getActionChain,
	getBuiltInAction,
	getEvalObjectAction,
	getPopUpAction,
	getPopUpDismissAction,
	getSaveObjectAction,
	getUpdateObjectAction,
} from './helpers'
import createAction from '../utils/createAction'

describe(coolGold(`ActionChain`), () => {
	describe(italic(`Generator`), () => {
		it(`should return an ${'AsyncGenerator'}`, () => {
			const ac = getActionChain({
				actions: [getEvalObjectAction()],
				trigger: 'onChange',
			})
			const gen = ActionChain.createGenerator(ac)
			expect(Symbol.asyncIterator in gen).to.be.true
		})

		describe(`Calling ${'next'}`, () => {
			it(`should always return the iterator result in the shape { value, done }`, async () => {
				const ac = getActionChain({
					actions: [getPopUpDismissAction()],
					trigger: 'onChange',
				})
				ac.loadQueue()
				let result = await ac.next()
				expect(result).to.have.property('done')
				expect(result).to.have.property('value')
				result = await ac.next()
				expect(result).to.have.property('done')
				expect(result).to.have.property('value')
			})

			it(`should always attach an action instance as the "value" property on the iterator result`, async () => {
				const ac = getActionChain({
					actions: [getPopUpDismissAction(), getBuiltInAction()],
					trigger: 'onChange',
				})
				ac.loadQueue()
				let result = await ac.next()
				expect(result).to.have.property('value').to.be.instanceOf(Action)
				result = await ac.next()
				expect(result).to.have.property('value').to.be.instanceOf(Action)
			})

			it(`should never return the same action in subsequent iterations`, async () => {
				const ac = getActionChain({
					actions: [getPopUpDismissAction(), getBuiltInAction()],
					trigger: 'onHover',
				})
				ac.loadQueue()
				let iteratorResult = await ac.next()
				const firstAction = iteratorResult.value
				iteratorResult = await ac.next()
				const secondAction = iteratorResult.value
				expect(firstAction).not.to.eq(secondAction)
				iteratorResult = await ac.next()
				const thirdAction = iteratorResult.value
				expect(firstAction).not.to.eq(thirdAction)
				expect(secondAction).not.to.eq(thirdAction)
			})

			it(`should pass the result of the previous action's callback as args`, async () => {
				const spy1 = sinon.spy(() => 'hello')
				const ac = getActionChain({
					actions: [{ action: getPopUpDismissAction(), fn: spy1 }],
					trigger: 'onChange',
				})
				const nextSpy = sinon.spy(ac, 'next')
				await ac.execute()
				expect(nextSpy.secondCall.args[0]).to.eq('hello')
				nextSpy.restore()
			})

			describe(`when it is the last item in the generator`, () => {
				it(`should return an array of results of objects in the shape of { action, result }`, async () => {
					const ac = getActionChain({
						actions: [getPopUpDismissAction(), getPopUpAction()],
						trigger: 'onChange',
					})
					const results = await ac.execute()
					expect(results).to.be.an('array').with.lengthOf(2)
					results.forEach((res) => {
						expect(res).to.have.property('action').to.be.instanceOf(Action)
						expect(res).to.have.property('result')
					})
				})
			})
		})
	})

	describe(italic(`Loading`), () => {
		it('should loadQueue up the instances', () => {
			const ac = getActionChain({
				actions: [getBuiltInAction(), getEvalObjectAction()],
				trigger: 'onMouseOver',
			})
			ac.queue.forEach((a) => expect(a).to.be.instanceOf(Action))
		})
	})

	describe(italic(`Execution`), () => {
		it('should call the "execute" method on every action', async () => {
			const spy1 = sinon.spy()
			const spy2 = sinon.spy()
			const ac = getActionChain({
				actions: [
					{ action: getBuiltInAction(), fn: spy1 },
					{ action: getEvalObjectAction(), fn: spy2 },
				],
				trigger: 'onChange',
			})
			await ac.execute()
			expect(spy1).to.be.calledOnce
			expect(spy2).to.be.calledOnce
		})

		it(`should set the current action instance as the value of the "current" property`, async () => {
			const ac = getActionChain({
				actions: [getBuiltInAction(), getEvalObjectAction()],
				trigger: 'onChange',
			})
			expect(ac.current).to.be.null
			let result = await ac.next()
			expect(ac.current).to.be.instanceOf(Action)
			expect(ac.current).to.have.property('actionType', 'builtIn')
			expect(ac.current).to.eq(result.value)
			result = await ac.next()
			expect(ac.current).to.be.instanceOf(Action)
			expect(ac.current).to.have.property('actionType', 'evalObject')
			expect(ac.current).to.eq(result.value)
		})

		describe(`Injecting`, () => {
			it(`should return the action instance`, () => {
				const ac = getActionChain({
					actions: [getBuiltInAction()],
					trigger: 'onChange',
				})
				const action = ac.inject(new Action(ac.trigger, getPopUpAction()))
				expect(action).to.be.instanceOf(Action)
			})

			it(`should add the new action in the beginning of the queue`, () => {
				const ac = getActionChain({
					actions: [getBuiltInAction(), getPopUpAction()],
					trigger: 'onChange',
				})
				expect(ac.queue).to.have.lengthOf(2)
				expect(ac.queue[0]).to.have.property('actionType', 'builtIn')
				ac.inject(new Action(ac.trigger, getPopUpAction()))
				expect(ac.queue).to.have.lengthOf(3)
				expect(ac.queue[0]).to.have.property('actionType', 'popUp')
			})

			it(`should add the new action inside its "injected" object in the snapshot`, () => {
				const ac = getActionChain({
					actions: [getBuiltInAction(), getEvalObjectAction()],
					trigger: 'onChange',
				})
				const injectee = getPopUpAction()
				ac.inject(injectee)
				expect(ac.snapshot().injected[0])
					.to.have.property('original')
					.eq(injectee)
			})

			describe(`When the action injecting is a popUp using "${chalk.magenta(
				'wait',
			)}"`, () => {
				it(`should set its status to "aborting"`, () => {
					const ac = getActionChain({
						actions: [getBuiltInAction(), getEvalObjectAction()],
						loader: (actions) => actions.map((action) => createAction(action)),
					})
					// expect(ac.).to.have.property('status', 'aborting')
				})

				xit(`should still execute the injectee`, () => {
					getBuiltInAction(), getEvalObjectAction()
					const ac = getActionChain({
						actions: [getUpdateObjectAction(), getSaveObjectAction()],
						trigger: 'onChange',
					})
					const injectee = getPopUpAction()
				})

				xit(`should call abort on the remaining actions in the queue`, () => {
					//
				})

				xit(`should not be calling executors when aborting`, () => {
					//
				})

				xit(`should set its status to "aborted" after its done`, () => {
					//
				})
			})
		})
	})

	describe(italic(`Aborting`), () => {
		it(`should return true if status is "aborted"`, () => {
			const ac = getActionChain({
				actions: [getBuiltInAction(), getEvalObjectAction()],
				trigger: 'onMouseLeave',
			})
			expect(ac.snapshot().status).to.eq(IDLE)
			ac.abort()
			expect(ac.snapshot().status).to.eq(ABORTED)
			expect(ac.isAborted()).to.be.true
		})

		it(`should not throw an error`, async () => {
			const ac = getActionChain({
				actions: [getEvalObjectAction()],
				trigger: 'placeholder',
			})
			await expect(ac.abort()).not.to.eventually.be.rejected
		})

		it(`should append the AbortExecuteError error object to each aborted result in the array`, async () => {
			const ac = getActionChain({
				actions: [getEvalObjectAction(), getBuiltInAction()],
				trigger: 'onChange',
			})
			await ac.abort()
			const results = ac.snapshot().results
			expect(results).to.have.lengthOf(2)
			ac.queue.forEach((_, index) => {
				expect(results[index].result).to.be.instanceOf(AbortExecuteError)
			})
		})
	})

	describe(italic(`Observers`), () => {
		xit(`should call ${magenta(`onAbortStart`)}`, () => {
			//
		})

		xit(`should call ${magenta(`onAbortEnd`)}`, () => {
			//
		})

		xit(`should call ${magenta(`onAbortError`)} if an error occurred`, () => {
			//
		})

		xit(
			`should call ${magenta(`onBeforeAbortAction`)} right before calling ` +
				`the actions' abort method`,
			() => {
				const ac = getActionChain({
					actions: [getBuiltInAction(), getEvalObjectAction()],
					trigger: 'onMouseLeave',
				})
				ac.loader = (actions) => {
					return actions.map((a) =>
						createAction({ action: a, trigger: 'onClick' }),
					)
				}
				ac.loadQueue()
			},
		)

		xit(
			`should call ${magenta(`onAfterAbortAction`)} right after calling ` +
				`the actions' abort method`,
			() => {
				//
			},
		)

		xit(`should call ${magenta(`onExecuteStart`)}`, () => {
			//
		})

		xit(`should call ${magenta(`onExecuteEnd`)}`, () => {
			//
		})

		xit(`should call ${magenta(`onExecuteResult`)}`, () => {
			//
		})

		xit(`should call ${magenta(`onRefresh`)}`, () => {
			//
		})

		xit(`should call ${magenta(`onBeforeInject`)}`, () => {
			//
		})

		xit(`should call ${magenta(`onAfterInject`)}`, () => {
			//
		})
	})

	describe(italic(`Return values`), () => {
		// it(`should reach the result as { action, result } in the first`, () => {
		// 	//
		// })

		it(`should receive an array of { action, result } when aborting`, async () => {
			const ac = getActionChain({
				actions: [getBuiltInAction(), getEvalObjectAction()],
				trigger: 'onChange',
			})
			await ac.next({})
			const results = await ac.abort('idk')
			expect(results).to.be.an('array')
			expect(results).to.have.lengthOf(ac.actions.length)
		})

		it(`should receive an array of { action, result } when execution is finished`, async () => {
			const ac = getActionChain({
				actions: [getBuiltInAction(), getEvalObjectAction()],
				trigger: 'onChange',
			})
			const results = await ac.execute()
			results.forEach((res) => {
				expect(res).to.have.property('action').to.be.instanceOf(Action)
				expect(res).to.have.property('result')
			})
		})
	})

	xdescribe(italic(`Timing out`), () => {
		describe.skip(`when action chains don't respond or don't finish`, () => {
			xit(`should call the timeout setTimeout callback`, async function () {
				const ac = getActionChain({
					actions: [getEvalObjectAction(), getPopUpAction()],
					trigger: 'onBlur',
				})
				await ac.execute()
				// expect(ac.state.status).to.eq('aborted')
			})

			xit(`should save the ref on the instance`, () => {
				//
			})

			xit(`should execute after the provided milliseconds`, () => {
				//
			})

			xit(`should call "abort" on all remainining actions in the queue`, () => {
				//
			})

			xit(`should call its own "abort" method after aborting the remaining actions`, () => {
				//
			})

			xit(`should throw with the ${'AbortExecuteError'} error`, () => {
				//
			})

			xit(`should set the status to "aborted" and set the reason as timed out`, () => {
				//
			})
		})
	})
})
