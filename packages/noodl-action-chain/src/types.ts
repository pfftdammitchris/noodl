import {
	AnyActionObject,
	ActionObject,
	EventType,
	ActionType,
} from 'noodl-types'
import AbortExecuteError from './AbortExecuteError'
import ActionChain from './ActionChain'
import Action from './Action'
import * as c from './constants'

export interface IActionChain<
	A extends ActionObject = AnyActionObject,
	E extends string = string
> {
	abort(reason?: string | string[]): Promise<ActionChainIteratorResult[]>
	actions: (A | AnyActionObject)[]
	current: Action | null
	execute(args?: any): Promise<ActionChainIteratorResult[]>
	inject(action: A | Action): Action
	queue: Action[]
	load(actions: A): Action
	load(actions: A[]): Action[]
	loadQueue(): Action[]
	snapshot(): {
		abortReason?: string | string[]
		actions: A[]
		error: null | Error | AbortExecuteError
		current: IActionChain['current']
		injected: A[]
		queue: IActionChain['queue']
		results: any[]
		status: ActionChainStatus
		trigger: E | EventType
	}
	trigger: E | EventType
}

// const s: IActionChain<GotoActionObject,ddd>
// const t=  s.actions[0]

export type ActionChainStatus =
	| typeof c.IDLE
	| typeof c.IN_PROGRESS
	| typeof c.ABORTED
	| typeof c.ERROR

export type ActionChainFuncsStore = Record<
	string,
	((...args: any[]) => any)[]
> & { builtIn: Record<string, ((...args: any[]) => any)[]> }

export type ActionChainIteratorResult = {
	action: Action
	result: any
}

export interface ActionChainActionCallback<A = Action> {
	(args: ActionChainCallbackArgs<A>): Promise<any>
}
export interface ActionChainCallbackArgs<A = Action> {
	action: A
	abort: ActionChain['abort']
	snapshot: ReturnType<ActionChain['snapshot']>
	[key: string]: any
}

export interface ActionChainInstancesLoader<A = ActionObject, RT = Action> {
	(actions: A[]): RT
}

export interface IAction<
	A extends {} = ActionObject,
	AType extends string = ActionType,
	T extends string = EventType
> {
	actionType: AType | ActionType
	abort(reason?: string | string[]): void
	execute(...args: any[]): Promise<any>
	executor?(...args: any[]): Promise<any>
	executed: boolean
	original: Omit<A, 'actionType'> & { actionType: AType | ActionType }
	result: any
	trigger: T | EventType
}

// const g: IAction<EmitObject, 'emit', 'hello'>
// g.actionType === 'emit'
// g.trigger === 'hello'

export type ActionStatus =
	| typeof c.ABORTED
	| typeof c.ERROR
	| typeof c.PENDING
	| typeof c.RESOLVED
	| typeof c.TIMED_OUT
