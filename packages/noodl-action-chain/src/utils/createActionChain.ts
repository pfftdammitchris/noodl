import { ActionObject, EventType } from 'noodl-types'
import { ActionChainInstancesLoader } from '../types'
import ActionChain from '../ActionChain'

function createActionChain<Trig = EventType>(
	trigger: Trig,
	actions: ActionObject[],
	loader?: ActionChainInstancesLoader,
): ActionChain
function createActionChain<Trig = EventType>(args: {
	actions: ActionObject[]
	trigger: Trig
	loader?: ActionChainInstancesLoader
}): ActionChain
function createActionChain<Trig extends EventType = EventType>(
	args:
		| {
				actions: ActionObject[]
				trigger: Trig
				loader?: ActionChainInstancesLoader
		  }
		| Trig,
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
