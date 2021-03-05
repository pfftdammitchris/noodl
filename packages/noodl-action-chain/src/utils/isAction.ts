import Action from '../Action'

function isAction(obj: unknown): obj is Action {
	return !!(obj && obj instanceof Action)
}

export default isAction
