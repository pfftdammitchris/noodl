import { ActionObject, EventType } from 'noodl-types'
import { LiteralUnion } from 'type-fest'
import { ActionChainInstancesLoader } from '../types'
import ActionChain from '../ActionChain'

function createActionChain<T extends string = string>(
	trigger: LiteralUnion<T | EventType, string>,
	actions: ActionObject[],
	loader?: ActionChainInstancesLoader,
): ActionChain
function createActionChain<T extends string = string>(args: {
	actions: ActionObject[]
	trigger: LiteralUnion<T | EventType, string>
	loader?: ActionChainInstancesLoader
}): ActionChain
function createActionChain<T extends string = string>(
	args:
		| {
				actions: ActionObject[]
				trigger: LiteralUnion<T | EventType, string>
				loader?: ActionChainInstancesLoader
		  }
		| T,
	actions?: ActionObject[] | ActionChainInstancesLoader,
	loader?: ActionChainInstancesLoader,
) {
	let _trigger: LiteralUnion<T | EventType, string>
	let _actions: ActionObject[] = []
	let _loader: ActionChainInstancesLoader | undefined

	if (typeof args === 'string') {
		_trigger = args
		_actions = actions as ActionObject[]
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
