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

	/**
	 * Trims the prefixed reference symbol
	 *
	 * ex: "=.builtIn.string.concat" --> "builtIn.string.concat"
	 *
	 * ex: "=..builtIn.string.concat" --> "builtIn.string.concat"
	 *
	 * ex: ".builtIn.string.concat" --> "builtIn.string.concat"
	 *
	 * ex: "..builtIn.string.concat" --> "builtIn.string.concat"
	 *
	 * ex: "____.builtIn.string.concat" --> "builtIn.string.concat"
	 *
	 * ex: "_.builtIn.string.concat" --> "builtIn.string.concat"
	 *
	 * @param v Reference string
	 * @returns string
	 */
	_isReference.trim = (v = '') =>
		v.replace(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || ''

	/**
	 * true: ".Global.currentUser.vertex.name.firstName@"
	 *
	 * true: "..message.doc.1.name@"
	 *
	 * false: "..message.doc.1.name"
	 */
	_isReference.await = (v = '') => v !== '@' && v.endsWith('@')

	/**
	 * True if the value starts with an equal sign "="
	 *
	 * true: "=.builtIn.string.concat"
	 *
	 * false: ".builtIn.string.concat"
	 *
	 * false: "builtIn.string.concat"
	 */
	_isReference.eval = (v = '') => v.startsWith('=')

	/**
	 * true: "=.."
	 *
	 * false: "=."
	 */
	_isReference.evalLocal = (v = '') => v.startsWith('=..')

	/**
	 * true: "=."
	 *
	 * false: "=.."
	 */
	_isReference.evalRoot = (v = '') =>
		!_isReference.evalLocal(v) && v.startsWith('=.')

	/**
	 * true: ".."
	 *
	 * true: "=.."
	 *
	 * false: "=."
	 */
	_isReference.local = function (v = ''): boolean {
		if (v.startsWith('..')) return true
		if (v.startsWith('=..')) return true
		v = _isReference.trim(v)
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
	_isReference.root = function (v: string): boolean {
		if (v.startsWith('..')) return false
		if (v.startsWith('=..')) return false
		if (v.startsWith('.') && v[1].toUpperCase() === v[1]) return true
		if (v.startsWith('=.') && v[2].toUpperCase() === v[2]) return true
		return false
	}

	/**
	 * Returns true if the value is prefixed with ~/ (placeholder for base url)
	 *
	 * true: "~/myBaseUrl"
	 *
	 * false: "/myBaseUrl"
	 *
	 * false: "myBaseUrl"
	 *
	 * false: "~myBaseUrl"
	 *
	 * @param v Reference string
	 * @returns { boolean }
	 */
	_isReference.tilde = (v = '') => v.startsWith('~/')

	/**
	 * True if the value is prefixed with N underscores followed by a single dot
	 *
	 * ex: _____.abc
	 *
	 * ex: _.SignIn.formData.password
	 *
	 * @param v Reference string
	 * @returns { boolean }
	 */
	_isReference.traverse = (v = '') => traverseRegex.test(v)

	return _isReference
})()

export default isReference
