const isReference = (function () {
	const format = (str = '') => {
		return str.replace(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || ''
	}

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

	const isEval = function (value: unknown): boolean {
		if (typeof value !== 'string') return false
		return value.startsWith('=')
	}

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
	_isReference.isEval = isEval
	_isReference.isLocal = isLocalReference
	_isReference.isRoot = isRootReference

	return _isReference
})()

export default isReference