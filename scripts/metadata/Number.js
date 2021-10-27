class NumberValue extends Number {
	type = 'number'
	value

	/**
	 * @param { number } value
	 */
	constructor(value) {
		super(value)
		this.value = value
	}

	toJSON() {
		return Number(this.value)
	}
}

export default NumberValue
