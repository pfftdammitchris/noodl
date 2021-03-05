import ActionChain from '../ActionChain'

function isActionChain(obj: unknown): obj is ActionChain {
	return !!(
		obj &&
		typeof obj === 'object' &&
		(obj instanceof ActionChain || 'loadQueue' in obj)
	)
}

export default isActionChain
