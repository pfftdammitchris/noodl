const isPlainObject = (v) => v != null && typeof v === 'object'

export function branch(test, left, right) {
	return test(left) || right
}

export function createEmit({ actions = [], dataKey }) {
	const result = {}
	return result
}

export function createIf(opts) {
	const result = []
	if (isPlainObject(opts)) {
		result.push(opts.cond)
		result.push(opts.left)
		result.push(opts.right)
	}
	return result
}

console.log(builder)
