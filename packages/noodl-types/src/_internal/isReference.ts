const traverseRegex = /^[_]+\./

const isReference = (function () {
	function _isReference(v: unknown): boolean {
		if (typeof v !== 'string') return false
		if (v === '.yml') return false
		if (v.startsWith('.')) return true
		if (v.startsWith('=')) return true
		if (v.startsWith('@')) return true
		if (v.startsWith('~')) return true
		if (traverseRegex.test(v)) return true
		return false
	}

	_isReference.format = function (v = '') {
		return v.replace(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || ''
	}

	/**
	 * true: ".Global.currentUser.vertex.name.firstName@"
	 *
	 * true: "..message.doc.1.name@"
	 *
	 * false: "..message.doc.1.name"
	 */
	_isReference.isAwaitingVal = function (v = '') {
		return v !== '@' && v.endsWith('@')
	}

	/**
	 * True if the value starts with an equal sign "="
	 */
	_isReference.isEval = function (v = '') {
		return v.startsWith('=')
	}

	/**
	 * Example: "=.."
	 */
	_isReference.isEvalLocal = function (v = '') {
		return v.startsWith('=..')
	}

	/**
	 * Example: "=."
	 */
	_isReference.isEvalRoot = function (v = '') {
		return !_isReference.isEvalLocal(v) && v.startsWith('=.')
	}

	/**
	 * true: ".."
	 *
	 * true: "=.."
	 *
	 * false: "=."
	 */
	_isReference.isLocal = function (v = ''): boolean {
		if (v.startsWith('..')) return true
		if (v.startsWith('=..')) return true
		v = _isReference.format(v)
		return !!v[0] && v[0].toLowerCase() === v[0]
	}

	/**
	 * true: "."
	 *
	 * true: "=."
	 *
	 * false: "=.."
	 *
	 * false: ".."
	 */
	_isReference.isRoot = function (v: string): boolean {
		if (v.startsWith('..')) return false
		if (v.startsWith('=..')) return false
		if (v.startsWith('.') && v[1].toUpperCase() === v[1]) return true
		if (v.startsWith('=.') && v[2].toUpperCase() === v[2]) return true
		return false
	}

	_isReference.isTilde = function (v = '') {
		return v.startsWith('~/')
	}

	_isReference.isTraverse = function (v = '') {
		return traverseRegex.test(v)
	}

	return _isReference
})()

export default isReference
