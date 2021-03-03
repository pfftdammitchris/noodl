import { ActionObject, ActionType, EventType } from 'noodl-types'
import { ActionStatus, IAction } from './types'
import { createId, isArray, isFunction } from './utils/common'
import AbortExecuteError from './AbortExecuteError'
import * as c from './constants'

const DEFAULT_TIMEOUT = 8000

class Action<
	A extends {} = ActionObject,
	AType extends ActionType = ActionType,
	T extends EventType = EventType
> implements IAction {
	#id: string
	#executor: IAction['executor']
	#original: IAction['original']
	#remaining: number = Infinity
	#status: ActionStatus | null = null
	#timeout: NodeJS.Timeout | null = null
	#trigger: T | EventType
	#interval: any | null = null
	actionType: AType | ActionType
	error: AbortExecuteError | Error | null = null
	executed: IAction['executed'] = false
	hasExecutor: boolean = false
	result: any
	receivedResult = false
	timeout = DEFAULT_TIMEOUT

	constructor(trigger: T | EventType, action: IAction['original']) {
		this.#id = createId()
		this.#original = action
		this.#trigger = trigger
		this.actionType = action.actionType
	}

	get executor() {
		return this.#executor
	}

	set executor(executor) {
		this.#executor = executor
		this.hasExecutor = isFunction(executor)
	}

	get id() {
		return this.#id
	}

	// TODO - Deprecate this to only allow it in the snapshot result
	get original() {
		return this.#original
	}

	get trigger() {
		return this.#trigger
	}

	get status() {
		return this.#status
	}

	set status(status) {
		this.#status = status
	}

	abort(reason: string | string[]) {
		if (isArray(reason)) reason = reason.join(', ')
		this.clearTimeout()
		this.status = c.ABORTED
		throw new AbortExecuteError(reason)
	}

	clearTimeout() {
		this.#timeout && clearTimeout(this.#timeout)
		this.#timeout = null
		this.#remaining = Infinity
	}

	clearInterval() {
		this.#interval && clearInterval(this.#interval)
		this.#interval = null
		this.#remaining = Infinity
	}

	/**
	 * Executes the callback that is registered to this action, optionally
	 * passing in any additional arguments
	 * @param { any } args - Arguments passed to the executor function
	 */
	async execute<Args extends any[]>(...args: Args): Promise<any> {
		try {
			this.clearTimeout()
			this.clearInterval()

			this.#remaining = this.timeout
			this.error = null
			this.executed = false
			this.result = undefined
			this.status = c.PENDING
			this.#interval = setInterval(() => (this.#remaining -= 1000), 1000)

			this.#timeout = setTimeout(() => {
				this.clearTimeout()
				this.status = c.TIMED_OUT
			}, this.timeout || DEFAULT_TIMEOUT)

			// TODO - Logic for return values as objects (new if/ condition in action chains)
			this.result = await this.executor?.(...args)
			if (this.result !== undefined) this['receivedResult'] = true
			this.status = c.RESOLVED

			return this.result
		} catch (error) {
			this.error = error
			this.status = c.ERROR
			throw error
		} finally {
			this.clearTimeout()
			this.clearInterval()
			this.executed = true
		}
	}

	// Returns an update-to-date JS representation of this instance
	// This is needed to log to the console the current state instead of logging
	// this instance directly where values will not be as expected
	snapshot() {
		const snapshot = {
			actionType: this.actionType,
			error: this.error,
			executed: this.executed,
			hasExecutor: this.hasExecutor,
			id: this.id,
			original: this.#original,
			remaining: this.#remaining,
			receivedResult: this.receivedResult,
			status: this.status,
			trigger: this.trigger,
			timeout: this.timeout,
		}
		if (this.status === c.RESOLVED) snapshot['result'] = this.result
		else if (this.status === c.ERROR) snapshot['result'] = this.error
		return snapshot
	}

	toString() {
		return JSON.stringify(this.snapshot(), null, 2)
	}
}

export default Action
