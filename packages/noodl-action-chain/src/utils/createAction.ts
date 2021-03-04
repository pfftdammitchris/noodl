import { ActionObject } from 'noodl-types'
import { LiteralUnion } from 'type-fest'
import { isString, isPlainObject } from '../utils/common'
import Action from '../Action'

function createAction<T extends string>(
	args:
		| LiteralUnion<T, string>
		| { action: ActionObject; trigger: LiteralUnion<T, string> },
	args2?: ActionObject,
) {
	let trigger: LiteralUnion<T, string> | undefined
	let object: ActionObject | undefined

	if (isString(args)) {
		trigger = args
		object = args2 as ActionObject
	} else if (isPlainObject(args)) {
		trigger = args.trigger
		object = args.action
	}

	return new Action(trigger as T, object as ActionObject)
}

export default createAction
