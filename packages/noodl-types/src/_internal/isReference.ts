const isReference = (function () {
	const format = (v = '') =>
		v.replace(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || ''

	const isLocalReference = function (value: unknown): boolean {
		if (typeof value !== 'string') return false
		if (value.startsWith('..')) return true
		if (value.startsWith('=..')) return true
		value = format(value)
		return !!value[0] && value[0].toLowerCase() === value[0]
	}

	const isRootReference = function (value: unknown): boolean {
		if (typeof value !== 'string') return false
		if (value.startsWith('..')) return false
		if (value.startsWith('=..')) return false
		if (value.startsWith('.')) return true
		if (value.startsWith('=.')) return true
		value = format(value)
		return !!value[0] && value[0].toUpperCase() === value[0]
	}

	const isEval = (value = '') => value.startsWith('=')
	const isEvalLocal = (value = '') => value.startsWith('=..')
	const isEvalRoot = (v = '') => !isEvalLocal(v) && v.startsWith('=.')
	const isAwaitingVal = (v = '') => v !== '@' && v.endsWith('@')

	function _isReference(value: unknown): boolean {
		if (typeof value !== 'string') return false
		if (value === '.yml') return false
		if (value.startsWith('.')) return true
		if (value.startsWith('=')) return true
		if (value.startsWith('@')) return true
		// if (value.endsWith('@')) return true
		return false
	}

	_isReference.format = format
	_isReference.isAwaitingVal = isAwaitingVal
	_isReference.isEval = isEval
	_isReference.isEvalLocal = isEvalLocal
	_isReference.isEvalRoot = isEvalRoot
	_isReference.isLocal = isLocalReference
	_isReference.isRoot = isRootReference

	return _isReference
})()

export default isReference
