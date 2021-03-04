import { ActionObject } from 'noodl-types'
import { LiteralUnion } from 'type-fest'
import AbortExecuteError from './AbortExecuteError'
import Action from './Action'
import createAction from './utils/createAction'
import { isArray, isPlainObject, isString } from './utils/common'
import {
	IActionChain,
	ActionChainInstancesLoader,
	ActionChainIteratorResult,
	ActionChainStatus,
	IAction,
} from './types'
import * as c from './constants'

class ActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
> implements IActionChain {
	#abortReason: string | string[] | undefined
	#actions: A[]
	#current: Action<A | ActionObject> | null = null
	#error: null | Error | AbortExecuteError = null
	#gen: AsyncGenerator<
		Action<A | ActionObject>,
		ActionChainIteratorResult[],
		any
	>
	#injected: Action<A | ActionObject>[] = []
	#loader: ActionChainInstancesLoader | undefined
	#obs: {
		onAbortStart?: (...args: any[]) => any
		onAbortEnd?: (...args: any[]) => any
		onExecuteStart?: (...args: any[]) => any
		onExecuteEnd?: (...args: any[]) => any
		onExecuteResult?: (result?: any) => any
		onRefresh?: (...args: any[]) => any
		onBeforeInject?: (action: A | ActionObject) => any
		onAfterInject?: (
			action: A | ActionObject,
			instance: IAction<A | ActionObject>,
		) => any
	} = {}
	#queue: Action<A | ActionObject>[] = []
	#results = [] as ActionChainIteratorResult[]
	#status: ActionChainStatus = c.IDLE
	#timeout: NodeJS.Timeout | null = null
	trigger: LiteralUnion<T, string>

	/**
	 * Creates an asynchronous generator that generates the next immediate action
	 * when the previous has ended
	 */
	static async *createGenerator<A extends ActionObject>(inst: ActionChain) {
		let action: Action<A | ActionObject> | undefined
		let results: ActionChainIteratorResult[] = []
		let result: any

		while (inst.queue.length) {
			action = inst.queue.shift() as Action<A | ActionObject>
			result = await (yield action)
			results.push({ action, result })
		}

		return results
	}

	constructor(trigger: T, actions: A[], loader?: ActionChainInstancesLoader) {
		this.trigger = trigger
		this.#actions = actions
		this.#loader = loader
	}

	get actions() {
		return this.#actions
	}

	get current() {
		return this.#current
	}

	get queue() {
		return this.#queue
	}

	set loader(loader: ActionChainInstancesLoader | undefined) {
		this.#loader = loader
	}

	/**
	 * Aborts the action chain from executing further
	 * @param { string | string[] | undefined } reason
	 */
	async abort(_reason?: string | string[]) {
		this.#obs.onAbortEnd?.()

		let reason: string | string[] | undefined

		if (_reason) {
			if (isArray(_reason) && _reason.length > 1) _reason.push(..._reason)
			else if (isArray(_reason)) reason = _reason[0]
			else if (_reason) reason = _reason
		}

		this.#setStatus('aborted', reason)

		// The loop below should handle the current pending action. Since this.current is never
		// in the queue, we have to insert it back to the list for the while loop to pick it up
		if (this.current && !this.current.executed) {
			this.#queue.unshift(this.current)
		}

		// Exhaust the remaining actions in the queue and abort them
		while (this.#queue.length) {
			const action = this.#queue.shift() as Action<A>
			if (action && action.status !== 'aborted') {
				// onBeforeAbortAction
				try {
					action?.abort(reason || '')
				} catch (error) {
					this.#error = error
				} finally {
					this.#results.push({
						action,
						result: new AbortExecuteError(
							'Aborted from calling the abort method',
						),
					})
				}
			}
		}
		// await this.#gen.return({} as any)
		this.#current = null
		this.#obs.onAbortEnd?.()
		return this.#results
	}

	async execute(args?: any, { timeout = 10000 }: { timeout?: number } = {}) {
		try {
			this.#results = []
			this.#setStatus(c.IN_PROGRESS)
			this.#obs.onExecuteStart?.()
			let action: Action<A | ActionObject> | undefined
			let iterator: IteratorResult<Action, ActionChainIteratorResult[]>
			let result: any

			// Initiates the generator (note: this first invocation does not execute
			// any actions, it steps into it so the actual execution of actions
			// begins at the second call to this.next)
			iterator = await this.next()
			action = iterator.value as Action<A | ActionObject>

			if (iterator) {
				while (!iterator.done) {
					try {
						if (this.#timeout) clearTimeout(this.#timeout)
						// Cache the reference since it could be changed when setTimeout fires
						let cachedAction = action
						this.#timeout = setTimeout(async () => {
							const msg = `Action of type "${cachedAction?.actionType}" timed out`
							cachedAction?.abort(msg)
							cachedAction = null as any
							try {
								await this.abort(msg)
								throw new AbortExecuteError(msg)
							} catch (error) {
								throw new AbortExecuteError(error.message)
							}
						}, timeout)

						if (action.status !== 'aborted') {
							result = await action.execute(args)
							this.#obs.onExecuteResult?.(result)
						}

						this.#results.push({ action, result: action.result })

						iterator = await this.next(result)

						if (!iterator.done) {
							action = iterator.value as Action<A | ActionObject>
						}

						if (isPlainObject(result) && 'wait' in result) {
							// This block is mostly intended for popUps to "wait" for a user interaction
							await this.abort(
								`An action returned from a "${action.actionType}" type requested to wait`,
							)
						}
					} catch (error) {
						// TODO - replace throw with appending the error to the result item instead
						throw error
					} finally {
						this.#timeout && clearTimeout(this.#timeout)
					}
				}
			}
		} catch (error) {
			await this.abort(error.message)
			throw new AbortExecuteError(error.message)
		} finally {
			this.#refresh()
			this.#obs.onExecuteEnd?.()
		}
		return this.#results
	}

	inject(action: A | ActionObject) {
		this.#obs.onBeforeInject?.(action)
		const inst = this.load(action)
		this.#queue.unshift(inst)
		this.#injected.push(inst)
		this.#obs.onAfterInject?.(action, inst)
		return inst
	}

	isAborted() {
		if (this.#status === c.ABORTED) return true
		return false
	}

	/**
	 * Converts one or more raw action objects to their instances and returns them.
	 * If a loader was provided in the constructor, it will delegate to that function
	 * to provide the instances
	 */
	load(action: A | ActionObject): Action<A | ActionObject>
	load(actions: (A | ActionObject)[]): Action<A | ActionObject>[]
	load(arg: A | ActionObject | (A | ActionObject)[]) {
		if (isArray(arg)) {
			return (
				this.#loader?.(arg) || arg.map((o) => createAction(this.trigger, o))
			)
		} else if (this.#loader) {
			return this.#loader([arg])[0]
		}
		return createAction(this.trigger, arg)
	}

	/**
	 * Loads the queue by converting actions into their instances. If a loader
	 * was provided in the constructor, it will use that function to load the queue
	 */
	loadQueue() {
		let actions = (this.#loader?.(this.actions) || []) as Action[]
		if (!Array.isArray(actions)) actions = [actions]

		actions.forEach((action, index) => (this.#queue[index] = action))

		if (this.#queue.length > actions.length) {
			while (this.#queue.length > actions.length) this.#queue.pop()
		}
		this.#gen = ActionChain.createGenerator<A>(this)
		return this.queue
	}

	/**
	 * Runs the next async iterator result as { done, value }
	 * @param { any } callerResult - Result of previous call passes as arguments to the generator yielder
	 */
	async next(callerResult?: any) {
		const result = await this.#gen?.next(callerResult)
		if (result) {
			if (!result.done && result.value instanceof Action) {
				this.#current = result.value
			}
			if (result.done) {
				this.#current = null
			}
		}
		return result
	}

	#refresh = () => {
		this.#timeout && clearTimeout(this.#timeout)
		this.loadQueue()
		this.#setStatus(c.IDLE)
		this.#obs.onRefresh?.()
	}

	#setStatus = (
		status: typeof c.IDLE | typeof c.IN_PROGRESS | typeof c.ABORTED,
		arg?: Error | AbortExecuteError | string | string[],
	) => {
		if (status === c.IDLE) {
			this.#status = c.IDLE
		} else if (status === c.IN_PROGRESS) {
			this.#status = c.IN_PROGRESS
		} else if (status === c.ABORTED) {
			this.#status = c.ABORTED
			if (isArray(arg) && arg.length > 1) {
				this.#abortReason = arg
			} else if (isArray(arg)) {
				this.#abortReason = arg[0]
			} else if (isString(arg)) {
				this.#abortReason = arg
			}
		} else if (status === c.ERROR) {
			this.#status = c.ERROR
			this.#error = arg as Error | AbortExecuteError
		}
		return this
	}

	/** Returns a snapshot of the overall state */
	snapshot() {
		return {
			abortReason: this.#abortReason,
			actions: this.actions,
			error: this.#error,
			current: this.current,
			injected: this.#injected,
			queue: this.queue,
			results: this.#results,
			status: this.#status,
			trigger: this.trigger,
		}
	}
}

export default ActionChain
