import { ActionObject } from 'noodl-types'
import { ActionChainInstancesLoader, Trigger } from '../types'
import ActionChain from '../ActionChain'

function createActionChain(args: {
  actions: ActionObject[]
  trigger: Trigger
  loader?: ActionChainInstancesLoader
}): ActionChain
function createActionChain(
  trigger: Trigger,
  actions: ActionObject[],
  loader?: ActionChainInstancesLoader,
): ActionChain
function createActionChain(
  args:
    | Trigger
    | {
        actions: ActionObject[]
        trigger: Trigger
        loader?: ActionChainInstancesLoader
      },
  actions?: ActionObject[] | ActionChainInstancesLoader,
  loader?: ActionChainInstancesLoader,
) {
  let _trigger: Trigger | undefined
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
