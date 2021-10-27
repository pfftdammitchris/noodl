class BooleanValue extends Boolean {
	type = 'boolean'
	value

	/**
	 * @param { boolean } value
	 */
	constructor(value) {
		super(value)
		this.value = value
	}

	toJSON() {
		return !!this.value
	}

	toString() {
		return String(!!this.value)
	}
}

export default BooleanValue
