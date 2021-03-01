import { ActionObject } from 'noodl-types'
import { IAction } from '../types'
import { isString, isPlainObject } from '../utils/common'
import Action from '../Action'

function createAction(
	args:
		| IAction['trigger']
		| { action: ActionObject; trigger: IAction['trigger'] },
	args2?: ActionObject,
) {
	let trigger: IAction['trigger'] | undefined
	let object: ActionObject | undefined

	if (isString(args)) {
		trigger = args
		object = args2 as ActionObject
	} else if (isPlainObject(args)) {
		trigger = args.trigger
		object = args.action
	}

	return new Action(trigger as string, object as ActionObject)
}

export default createAction
