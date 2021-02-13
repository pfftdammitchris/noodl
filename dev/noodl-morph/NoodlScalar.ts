import { Scalar } from 'yaml/types'
import Identify from './Identify'

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
}

export default NoodlScalar
