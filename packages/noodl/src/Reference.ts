import yaml from 'yaml'

class Reference {
	#node: yaml.Scalar<string>
	#prev: Reference | null
	#next: Reference | null
	#ref = ''
	#value = null

	constructor(node: yaml.Scalar<string>) {
		this.#ref = node.value
		this.#node = node
		this.#value = null
		this.#prev = null
		this.#next = null
	}
	isRoot() {
		return !!this.path && this.path[0].toUpperCase() === this.path[0]
	}
	isLocal() {
		return !!this.path && this.path[0].toLowerCase() === this.path[0]
	}
	/** @return { string } */
	get path() {
		return this.#ref?.replace?.(/^[.\=@]+/i, '').replace(/[.\=@]+$/i, '') || ''
	}
	get paths() {
		return this.path.split('.')
	}
	get value() {
		return this.#value
	}
	set value(value) {
		this.#value = value || null
	}
	hasValue() {}
	isFormatted(value) {
		return !/^[a-zA-Z]/i.test(value)
	}
	prev() {
		return this.#prev
	}
	next() {
		return this.#next
	}

	toJSON() {
		return {
			isRoot: this.isRoot(),
			isLocal: this.isLocal(),
			path: this.path,
			paths: this.paths,
			value: this.#value,
		}
	}

	toString() {
		return this.#ref
	}
}

export default Reference
