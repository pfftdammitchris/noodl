class PropUnion {
	options = {
		boolean: 'boolean',
		object: 'Record<string, any>',
		function: '((...args: any[]) => any)',
		number: 'number',
		null: 'null',
		string: 'string',
		undefined: 'undefined',
	}
	value = ''

	add(property: string, val: any) {
		if (!this.value.includes(property)) {
			this.value += `| ${property}`
		}
	}

	has(key: string) {
		if (this.value?.[key]) return true
		return false
	}
}

export default PropUnion
