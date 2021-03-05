import { ActionObject } from 'noodl-types'
import { ActionChainInstancesLoader } from '../types'
import ActionChain from '../ActionChain'

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
>(
	trigger: T,
	actions: A[],
	loader?: ActionChainInstancesLoader<A, T>,
): ActionChain<A, T>

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
>(args: {
	actions: A[]
	trigger: T
	loader?: ActionChainInstancesLoader<A, T>
}): ActionChain<A, T>

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
>(
	args:
		| {
				actions: A[]
				trigger: T
				loader?: ActionChainInstancesLoader<A, T>
		  }
		| T,
	actions?: A[] | ActionChainInstancesLoader<A, T>,
	loader?: ActionChainInstancesLoader<A, T>,
) {
	let _trigger: T
	let _actions: A[] = []
	let _loader: ActionChainInstancesLoader<A, T> | undefined

	if (typeof args === 'string') {
		_trigger = args
		_actions = actions as A[]
		_loader = loader
	} else {
		_trigger = args.trigger
		_actions = args.actions
		_loader = args.loader
	}

	const actionChain = new ActionChain(_trigger, _actions, _loader)
	return actionChain
}

export default createActionChain
