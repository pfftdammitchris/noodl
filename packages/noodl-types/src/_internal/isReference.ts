const isReference = (function () {
	function _isReference(v: unknown): boolean {
		if (typeof v !== 'string') return false
		if (v === '.yml') return false
		if (v.startsWith('.')) return true
		if (v.startsWith('=')) return true
		if (v.startsWith('@')) return true
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
		if (v.startsWith('.')) return true
		if (v.startsWith('=.')) return true
		v = _isReference.format(v)
		return !!v[0] && v[0].toUpperCase() === v[0]
	}

	_isReference.isTilde = function (v = '') {
		return v.startsWith('~')
	}

	return _isReference
})()

export default isReference
