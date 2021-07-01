import Reference from '../Reference'

function isRefNode(value: unknown): value is Reference {
	return (
		typeof value !== null &&
		typeof value === 'object' &&
		'type' in (value || {}) &&
		(value as any)?.type === 'REFERENCE'
	)
}

export default isRefNode
