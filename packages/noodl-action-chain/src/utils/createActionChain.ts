import { ActionObject } from 'noodl-types'
import { ActionChainInstancesLoader } from '../types'
import ActionChain from '../ActionChain'

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string,
>(
	trigger: T,
	actions: A[],
	loader?: ActionChainInstancesLoader<A, T>,
	id?: string,
): ActionChain<A, T>

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string,
>(args: {
	actions: A[]
	trigger: T
	loader?: ActionChainInstancesLoader<A, T>
	id?: string
}): ActionChain<A, T>

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string,
>(
	args:
		| {
				actions: A[]
				trigger: T
				loader?: ActionChainInstancesLoader<A, T>
				id?: string
		  }
		| T,
	actions?: A[] | ActionChainInstancesLoader<A, T>,
	loader?: ActionChainInstancesLoader<A, T>,
	id?: string,
) {
	let _trigger: T
	let _actions: A[] = []
	let _loader: ActionChainInstancesLoader<A, T> | undefined
	let _id = ''

	if (typeof args === 'string') {
		_trigger = args
		_actions = actions as A[]
		_loader = loader
		_id = id
	} else {
		_trigger = args.trigger
		_actions = args.actions
		_loader = args.loader
		_id = args.id
	}

	const actionChain = new ActionChain(_trigger, _actions, _loader, _id)
	return actionChain
}

export default createActionChain
