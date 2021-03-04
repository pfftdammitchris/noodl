import { ActionObject } from 'noodl-types'
import { LiteralUnion } from 'type-fest'
import AbortExecuteError from './AbortExecuteError'
import * as c from './constants'

export interface IActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
> {
	abort(reason?: string | string[]): Promise<ActionChainIteratorResult[]>
	actions: A[]
	current: IAction<A | ActionObject> | null
	execute(args?: any): Promise<ActionChainIteratorResult[]>
	inject(action: A | ActionObject): IAction<A | ActionObject>
	queue: IAction<A | ActionObject>[]
	load(actions: A | ActionObject): IAction<A | ActionObject>
	load(actions: (A | ActionObject)[]): IAction<A | ActionObject>[]
	loadQueue(): IAction<A>[]
	snapshot(): {
		abortReason?: string | string[]
		actions: A[]
		error: null | Error | AbortExecuteError
		current: IAction<A> | null
		injected: (A | ActionObject)[]
		queue: IAction<A | ActionObject>[]
		results: any[]
		status: ActionChainStatus
		trigger: LiteralUnion<T, string>
	}
	trigger: LiteralUnion<T, string>
}

export type ActionChainStatus =
	| typeof c.IDLE
	| typeof c.IN_PROGRESS
	| typeof c.ABORTED
	| typeof c.ERROR

export type ActionChainIteratorResult<A extends ActionObject = ActionObject> = {
	action: IAction<A>
	result: any
}

export interface ActionChainInstancesLoader<A = ActionObject, RT = IAction> {
	(actions: A[]): RT[]
}

export interface IAction<
	A extends {} = ActionObject,
	AType extends string = string,
	T extends string = string
> {
	actionType: LiteralUnion<AType, string>
	abort(reason?: string | string[]): void
	execute(...args: any[]): Promise<any>
	executor(...args: any[]): Promise<any>
	executed: boolean
	original: Omit<A, 'actionType'> & { actionType: LiteralUnion<AType, string> }
	result: any
	trigger: LiteralUnion<T, string>
}

export type ActionStatus =
	| typeof c.ABORTED
	| typeof c.ERROR
	| typeof c.PENDING
	| typeof c.RESOLVED
	| typeof c.TIMED_OUT
