import { ActionObject, EventType } from 'noodl-types'
import { isArray, isPlainObject, isString } from './utils/common'
import AbortExecuteError from './AbortExecuteError'
import Action from './Action'
import createAction from './utils/createAction'
import * as T from './types'
import * as c from './constants'

class ActionChain<A extends ActionObject = ActionObject, Trigger = EventType>
	implements T.IActionChain {
	#abortReason: ReturnType<T.IActionChain['snapshot']>['abortReason'] = ''
	#actions: T.IActionChain['actions'] = []
	#current: T.IActionChain['current'] = null
	#error: null | Error | AbortExecuteError = null
	#gen: AsyncGenerator<Action, T.ActionChainIteratorResult[], any>
	#injected: ReturnType<T.IActionChain['snapshot']>['actions'] = []
	#loader: T.ActionChainInstancesLoader | undefined
	#obs: {
		onAbortStart: (...args: any[]) => any
		onAbortEnd: (...args: any[]) => any
		onExecuteStart: (...args: any[]) => any
		onExecuteEnd: (...args: any[]) => any
		onExecuteResult: (...args: any[]) => any
		onRefresh: (...args: any[]) => any
		onBeforeInject: (...args: any[]) => any
		onAfterInject: (...args: any[]) => any
	}
	#queue: T.IActionChain['queue'] = []
	#results = [] as T.ActionChainIteratorResult[]
	#status: T.ActionChainStatus = c.IDLE
	#timeout: NodeJS.Timeout | null = null
	trigger: T.IActionChain['trigger']

	/**
	 * Creates an asynchronous generator that generates the next immediate action
	 * when the previous has ended
	 */
	static async *createGenerator(inst: ActionChain) {
		let action: Action | undefined
		let results: T.ActionChainIteratorResult[] = []
		let result: any

		while (inst.queue.length) {
			action = inst.queue.shift() as Action
			result = await (yield action)
			results.push({ action, result })
		}

		return results
	}

	constructor(
		trigger: EventType,
		actions: T.IActionChain['actions'],
		loader?: T.ActionChainInstancesLoader,
	) {
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

	set loader(loader: T.ActionChainInstancesLoader | undefined) {
		this.#loader = loader
	}

	/**
	 * Aborts the action chain from executing further
	 * @param { string | string[] | undefined } reason
	 */
	async abort(_reason?: string | string[]) {
		// onAbortStart

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
			const action = this.#queue.shift() as Action
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
		return this.#results
	}

	async execute(args?: any, { timeout = 10000 }: { timeout?: number } = {}) {
		try {
			this.#results = []
			this.#setStatus(c.IN_PROGRESS)
			let action: Action | undefined
			let iterator: IteratorResult<Action, T.ActionChainIteratorResult[]>
			let result: any

			// Initiates the generator (note: this first invocation does not execute
			// any actions, it steps into it so the actual execution of actions
			// begins at the second call to this.next)
			iterator = await this.next()
			action = iterator.value as Action

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

						result = await action.execute(args)
						this.#results.push({ action, result })
						iterator = await this.next(result)

						if (!iterator.done) {
							action = iterator.value as Action
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
		}
		return this.#results
	}

	inject(action: Action) {
		this.#queue.unshift(action)
		this.#injected.push(action)
		return action
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
	load(action: ActionObject): Action
	load(actions: ActionObject[]): Action[]
	load(arg: ActionObject | ActionObject[]) {
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

		actions.forEach((action, index, coll) => (this.#queue[index] = action))

		if (this.#queue.length > actions.length) {
			while (this.#queue.length > actions.length) this.#queue.pop()
		}
		this.#gen = ActionChain.createGenerator(this)
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
		// onRefresh
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
