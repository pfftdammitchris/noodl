import { Identify } from 'noodl-types'
import nu from 'noodl-utils'

class StringValue {
	value;

	[Symbol.for('nodejs.util.inspect.custom')]() {
		return this.toJSON()
	}

	/**
	 * @param { string } value
	 */
	constructor(value) {
		this.value = value
	}

	isReference() {
		return Identify.reference(this.value)
	}

	isLocalReference() {
		return Identify.localReference(this.value)
	}

	isRootReference() {
		return Identify.rootReference(this.value)
	}

	isEvalReference() {
		return Identify.evalReference(this.value)
	}

	isEvalLocalReference() {
		return Identify.evalLocalReference(this.value)
	}

	isEvalRootReference() {
		return Identify.evalRootReference(this.value)
	}

	isAwaitRootReference() {
		return Identify.awaitReference(this.value)
	}

	isTildeReference() {
		return Identify.tildeReference(this.value)
	}

	isTraverseReference() {
		return Identify.traverseReference(this.value)
	}

	isLocalKey() {
		return Identify.localKey(nu.trimReference(this.value))
	}

	isRootKey() {
		return Identify.rootKey(nu.trimReference(this.value))
	}

	toJSON() {
		return {
			value: this.value,
			rootKey: this.isRootKey(),
			reference: this.isReference(),
		}
	}

	toString() {
		return JSON.stringify(this.toJSON(), null, 2)
	}
}

export default StringValue
