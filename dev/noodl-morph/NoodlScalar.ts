import { Scalar } from 'yaml/types'
import Identify from './utils/Identify'

class NoodlScalar extends Scalar {
	constructor(args) {
		super(args)
	}

	isBoolean() {
		return Identify.boolean(this)
	}

	isBooleanTrue() {
		return Identify.booleanTrue(this)
	}

	isBooleanFalse() {
		return Identify.booleanFalse(this)
	}

	isContinue() {
		return Identify.continue(this)
	}

	isReference() {
		return Identify.reference(this)
	}

	isLocalReference() {
		return Identify.localReference(this)
	}

	isRootReference() {
		return Identify.rootReference(this)
	}

	isTraverseReference() {
		return Identify.traverseReference(this)
	}
}

export default NoodlScalar
