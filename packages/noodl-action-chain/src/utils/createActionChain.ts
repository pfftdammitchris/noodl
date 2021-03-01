import { ActionObject } from 'noodl-types'
import { IActionChain, ActionChainInstancesLoader } from '../types'
import ActionChain from '../ActionChain'

function createActionChain<
	Trig extends IActionChain['trigger'] = string
>(args: {
	actions: ActionObject[]
	trigger: Trig
	loader?: ActionChainInstancesLoader
}): ActionChain
function createActionChain<Trig extends string = string>(
	trigger: Trig,
	actions: ActionObject[],
	loader?: ActionChainInstancesLoader,
): ActionChain
function createActionChain<Trig extends string = string>(
	args:
		| Trig
		| {
				actions: ActionObject[]
				trigger: Trig
				loader?: ActionChainInstancesLoader
		  },
	actions?: ActionObject[] | ActionChainInstancesLoader,
	loader?: ActionChainInstancesLoader,
) {
	let _trigger: Trig | undefined
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
