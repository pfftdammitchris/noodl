class ArrayValue extends Array {
	type = 'array'
	value

	/**
	 *
	 * @param { any[] } value
	 */
	constructor(value = []) {
		super(value)
		this.value = value
	}

	get length() {
		return this.value.length
	}

	includes(value) {
		return this.value.includes(value)
	}

	toJSON() {
		return this.value
	}

	toString() {
		return JSON.stringify(this.value, null, 2)
	}
}

export default ArrayValue
