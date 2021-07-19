const isReference = (function () {
	const format = (v = '') =>
		v.replace(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || ''

	const isLocalReference = function (v = ''): boolean {
		if (v.startsWith('..')) return true
		if (v.startsWith('=..')) return true
		v = format(v)
		return !!v[0] && v[0].toLowerCase() === v[0]
	}

	const isRootReference = function (v: string): boolean {
		if (v.startsWith('..')) return false
		if (v.startsWith('=..')) return false
		if (v.startsWith('.')) return true
		if (v.startsWith('=.')) return true
		v = format(v)
		return !!v[0] && v[0].toUpperCase() === v[0]
	}

	const isAwaitingVal = (v = '') => v !== '@' && v.endsWith('@')
	const isEval = (v = '') => v.startsWith('=')
	const isEvalLocal = (v = '') => v.startsWith('=..')
	const isEvalRoot = (v = '') => !isEvalLocal(v) && v.startsWith('=.')
	const isTilde = (v = '') => v.startsWith('~')

	function _isReference(v: unknown): boolean {
		if (typeof v !== 'string') return false
		if (v === '.yml') return false
		if (v.startsWith('.')) return true
		if (v.startsWith('=')) return true
		if (v.startsWith('@')) return true
		return false
	}

	_isReference.format = format
	/**
	 * true: ".Global.currentUser.vertex.name.firstName@"
	 *
	 * true: "..message.doc.1.name@"
	 *
	 * false: "..message.doc.1.name"
	 */
	_isReference.isAwaitingVal = isAwaitingVal
	/**
	 * True if the value starts with an equal sign "="
	 */
	_isReference.isEval = isEval
	/**
	 * Example: "=.."
	 */
	_isReference.isEvalLocal = isEvalLocal
	/**
	 * Example: "=."
	 */
	_isReference.isEvalRoot = isEvalRoot
	/**
	 * true: ".."
	 *
	 * true: "=.."
	 *
	 * false: "=."
	 */
	_isReference.isLocal = isLocalReference
	/**
	 * true: "."
	 *
	 * true: "=."
	 *
	 * false: "=.."
	 *
	 * false: ".."
	 */
	_isReference.isRoot = isRootReference
	_isReference.isTilde = isTilde

	return _isReference
})()

export default isReference
