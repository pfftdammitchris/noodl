import { ActionObject, userEvent } from 'noodl-types'
import AbortExecuteError from './AbortExecuteError'
import ActionChain from './ActionChain'
import Action from './Action'
import * as c from './constants'

export interface IActionChain {
	abort(reason?: string | string[]): Promise<ActionChainIteratorResult[]>
	actions: ActionObject[]
	current: Action | null
	execute(args?: any): Promise<ActionChainIteratorResult[]>
	inject(action: ActionObject | Action): Action
	queue: Action[]
	load(actions: ActionObject): Action
	load(actions: ActionObject[]): Action[]
	loadQueue(): Action[]
	snapshot(): {
		abortReason?: string | string[]
		actions: IActionChain['actions']
		error: null | Error | AbortExecuteError
		current: IActionChain['current']
		injected: ActionObject[]
		queue: IActionChain['queue']
		results: any[]
		status: ActionChainStatus
		trigger: IActionChain['trigger']
	}
	trigger: Trigger
}

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

export interface ActionChainInstancesLoader {
	(actions: ActionObject[]): Action[]
}

export interface IAction<A extends ActionObject = ActionObject> {
	id: string
	actionType: string
	abort(reason?: string | string[]): void
	error: null | Error | AbortExecuteError
	execute(...args: any[]): Promise<any>
	executor?(...args: any[]): Promise<any>
	executed: boolean
	result: any
	snapshot(): { original: Partial<A> } & { [key: string]: any }
	status: null | ActionStatus
	timeout: number
	trigger: Trigger
}

export type ActionStatus =
	| typeof c.ABORTED
	| typeof c.ERROR
	| typeof c.PENDING
	| typeof c.RESOLVED
	| typeof c.TIMED_OUT

export type Trigger = typeof userEvent[number]
