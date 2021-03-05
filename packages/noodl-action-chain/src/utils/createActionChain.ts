import { ActionObject } from 'noodl-types'
import { LiteralUnion } from 'type-fest'
import { ActionChainInstancesLoader } from '../types'
import ActionChain from '../ActionChain'

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
>(
	trigger: LiteralUnion<T, string>,
	actions: A[],
	loader?: ActionChainInstancesLoader<A>,
): ActionChain<A, T>

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
>(args: {
	actions: A[]
	trigger: LiteralUnion<T, string>
	loader?: ActionChainInstancesLoader<A>
}): ActionChain<A, T>

function createActionChain<
	A extends ActionObject = ActionObject,
	T extends string = string
>(
	args:
		| {
				actions: A[]
				trigger: LiteralUnion<T, string>
				loader?: ActionChainInstancesLoader<A>
		  }
		| T,
	actions?: A[] | ActionChainInstancesLoader<A>,
	loader?: ActionChainInstancesLoader<A>,
) {
	let _trigger: LiteralUnion<T, string>
	let _actions: A[] = []
	let _loader: ActionChainInstancesLoader<A> | undefined

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
