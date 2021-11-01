class NoodlNode<V = any> {
	#left: NoodlNode | null = null
	#right: NoodlNode | null = null
	value: V

	constructor(value: V) {
		this.value = value
	}

	get left() {
		return this.#left
	}

	set left(node) {
		this.#left = node
	}

	get right() {
		return this.#right
	}

	set right(node) {
		this.#right = node
	}

	enter(node: NoodlNode) {
		//
	}

	exit(node: NoodlNode) {
		//
	}
}

export default NoodlNode
