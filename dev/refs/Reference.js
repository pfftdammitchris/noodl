class Reference {
	#context = ''
	/** @type { string } ref */
	#ref = ''
	#touched = false
	#value = null

	constructor(node, opts) {
		this.#ref = node.value
		/** @type { yaml.Node } */
		this.node = node
		this.#value = null
		/** @type { yaml.Node | null } */
		this._prev = null
		/** @type { yaml.Node | null } */
		this._next = null
		if (opts?.context) this.#context = opts.context
	}

	isRoot() {
		return !!this.path && this.path[0].toUpperCase() === this.path[0]
	}

	isLocal() {
		return !!this.path && this.path[0].toLowerCase() === this.path[0]
	}

	get context() {
		return this.#context
	}

	set context(context) {
		this.#context = context
	}

	/** @return { string } */
	get path() {
		return this.#ref?.replace?.(/^[.=@]+/i, '').replace(/[.=@]+$/i, '') || ''
	}

	get paths() {
		return this.path.split('.')
	}

	get value() {
		return this.#value
	}

	set value(value) {
		this.#value = value || null
		if (!this.#touched) this.#touched = true
	}

	hasValue() {}

	isFormatted(value) {
		return !/^[a-zA-Z]/i.test(value)
	}

	/** @return { yaml.Node } */
	prev() {
		return this._prev
	}

	/** @return { yaml.Node } */
	next() {
		return this._next
	}

	toJSON() {
		return {
			context: this.context,
			isRoot: this.isRoot(),
			isLocal: this.isLocal(),
			path: this.path,
			paths: this.paths,
			value: this.value || null,
		}
	}

	toString() {
		return this.#ref
	}
}

module.exports = Reference
