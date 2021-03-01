import { ActionObject } from 'noodl-types'
import { Trigger } from '../types'
import { isString, isPlainObject } from '../utils/common'
import Action from '../Action'

function createAction(
  args: Trigger | { action: ActionObject; trigger: Trigger },
  args2?: ActionObject,
) {
  let trigger: Trigger | undefined
  let object: ActionObject | undefined

  if (isString(args)) {
    trigger = args
    object = args2 as ActionObject
  } else if (isPlainObject(args)) {
    trigger = args.trigger
    object = args.action
  }

  return new Action(trigger as Trigger, object as ActionObject)
}

export default createAction
