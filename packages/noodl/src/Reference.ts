import * as u from '@jsmanifest/utils'
import yaml from 'yaml'

class Reference {
	#node: yaml.Scalar<string>
	#prev: Reference | null
	#next: Reference | null
	#ref = ''
	#value = null
	readonly type = 'REFERENCE'

	constructor(arg: string | yaml.Scalar<string>) {
		this.#node = yaml.isNode(arg) ? arg : new yaml.Scalar(arg)
		this.#ref = this.#node.value
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

	get node() {
		return this.#node
	}

	set node(node) {
		this.#node = node
	}

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
